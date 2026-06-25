import type { ChatOllama } from '@langchain/ollama';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { HybridResult } from '../../retriever/hybrid.js';
import { createNodes } from '../nodes.js';

vi.mock('../../retriever/hybrid.js', () => ({
  hybridSearch: vi.fn(),
}));

import { hybridSearch } from '../../retriever/hybrid.js';

const _chunk = (content: string, source = 'test.md'): HybridResult => ({
  content,
  metadata: { source, extension: '.md', chunkIndex: 0 },
  score: 0.5,
  rank: 1,
});

const _state = (
  overrides: Partial<{
    rewrittenQuery: string;
    chunks: HybridResult[];
    relevantChunks: Array<{ content: string; source: string }>;
    retryCount: number;
  }> = {},
) => ({
  query: 'test query',
  rewrittenQuery: '',
  chunks: [] as HybridResult[],
  relevantChunks: [] as Array<{ content: string; source: string }>,
  answer: '',
  retryCount: 0,
  sources: [] as string[],
  ...overrides,
});

describe('createNodes', () => {
  const llmInvoke = vi.fn();
  const fakeLlm = { invoke: llmInvoke } as unknown as ChatOllama;
  const nodes = createNodes(fakeLlm);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rewriteQuery', () => {
    it('calls LLM once and returns trimmed rewrittenQuery', async () => {
      llmInvoke.mockResolvedValue({ content: '  rewritten query  ' });
      const result = await nodes.rewriteQuery(_state());
      expect(llmInvoke).toHaveBeenCalledOnce();
      expect(result).toEqual({ rewrittenQuery: 'rewritten query' });
    });
  });

  describe('retrieve', () => {
    it('uses rewrittenQuery when set', async () => {
      vi.mocked(hybridSearch).mockResolvedValue([]);
      await nodes.retrieve(_state({ rewrittenQuery: 'rewritten' }));
      expect(hybridSearch).toHaveBeenCalledWith('rewritten', 5);
    });

    it('falls back to query when rewrittenQuery is empty', async () => {
      vi.mocked(hybridSearch).mockResolvedValue([]);
      await nodes.retrieve(_state({ rewrittenQuery: '' }));
      expect(hybridSearch).toHaveBeenCalledWith('test query', 5);
    });

    it('returns hybridSearch result as chunks', async () => {
      const chunks = [_chunk('chunk content')];
      vi.mocked(hybridSearch).mockResolvedValue(chunks);
      const result = await nodes.retrieve(_state());
      expect(result).toEqual({ chunks });
    });
  });

  describe('gradeChunks', () => {
    it('keeps only chunks rated yes in relevantChunks', async () => {
      llmInvoke
        .mockResolvedValueOnce({ content: 'yes' })
        .mockResolvedValueOnce({ content: 'no' })
        .mockResolvedValueOnce({ content: 'yes' });
      const chunks = [_chunk('a', 'a.md'), _chunk('b', 'b.md'), _chunk('c', 'c.md')];
      const result = await nodes.gradeChunks(_state({ chunks }));
      expect(result.relevantChunks).toHaveLength(2);
      expect(result.relevantChunks?.[0]).toEqual({ content: 'a', source: 'a.md' });
      expect(result.relevantChunks?.[1]).toEqual({ content: 'c', source: 'c.md' });
    });

    it('returns empty relevantChunks when all rated no', async () => {
      llmInvoke.mockResolvedValue({ content: 'no' });
      const result = await nodes.gradeChunks(_state({ chunks: [_chunk('x')] }));
      expect(result.relevantChunks).toHaveLength(0);
    });
  });

  describe('generateAnswer', () => {
    it('uses chunks as fallback when relevantChunks is empty', async () => {
      llmInvoke.mockResolvedValue({ content: 'fallback answer' });
      const chunks = [_chunk('fallback content', 'src.md')];
      const result = await nodes.generateAnswer(_state({ chunks, relevantChunks: [] }));
      const prompt = llmInvoke.mock.calls[0][0] as string;
      expect(prompt).toContain('fallback content');
      expect(result.answer).toBe('fallback answer');
      expect(result.sources).toContain('src.md');
    });
  });

  describe('broadenQuery', () => {
    it('increments retryCount and returns trimmed new rewrittenQuery', async () => {
      llmInvoke.mockResolvedValue({ content: '  broader query  ' });
      const result = await nodes.broadenQuery(_state({ rewrittenQuery: 'narrow', retryCount: 1 }));
      expect(result).toEqual({ rewrittenQuery: 'broader query', retryCount: 2 });
    });
  });
});
