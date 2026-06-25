import { describe, expect, it, vi } from 'vitest';

vi.mock('@langchain/ollama', () => {
  class ChatOllama {
    invoke = vi.fn();
  }
  return { ChatOllama };
});
vi.mock('../../retriever/hybrid.js', () => ({ hybridSearch: vi.fn() }));
vi.mock('../../config.js', () => ({
  config: {
    rag: { minRelevantChunks: 2, maxRetrieveRetries: 2 },
    ollama: { model: 'test-model', baseUrl: 'http://localhost:11434' },
    chroma: { url: 'http://localhost:8000', collection: 'test' },
  },
}));

import { shouldContinue } from '../graph.js';

const _state = (
  relevantChunks: Array<{ content: string; source: string }>,
  retryCount: number,
) => ({
  query: 'q',
  rewrittenQuery: '',
  chunks: [],
  relevantChunks,
  answer: '',
  retryCount,
  sources: [],
});

describe('shouldContinue', () => {
  it('returns generateAnswer when relevantChunks reaches minimum', () => {
    const state = _state(
      [
        { content: 'a', source: 's' },
        { content: 'b', source: 's' },
      ],
      0,
    );
    expect(shouldContinue(state)).toBe('generateAnswer');
  });

  it('returns generateAnswer when retries exhausted even with 0 relevant chunks', () => {
    expect(shouldContinue(_state([], 2))).toBe('generateAnswer');
  });

  it('returns broadenQuery when chunks below minimum and retries remain', () => {
    const state = _state([{ content: 'a', source: 's' }], 0);
    expect(shouldContinue(state)).toBe('broadenQuery');
  });

  it('returns broadenQuery when 0 chunks and 0 retries', () => {
    expect(shouldContinue(_state([], 0))).toBe('broadenQuery');
  });
});
