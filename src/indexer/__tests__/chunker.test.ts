import { describe, expect, it } from 'vitest';
import { chunkDocument } from '../chunker.js';
import type { LoadedDoc } from '../loaders.js';

const _doc = (content: string, source = 'test.md'): LoadedDoc => ({
  content,
  metadata: { source, extension: '.md' },
});

describe('chunkDocument', () => {
  it('returns at least one chunk for non-empty content', async () => {
    const chunks = await chunkDocument(_doc('# Hello\n\nThis is a test document.'));
    expect(chunks.length).toBeGreaterThan(0);
  });

  it('returns empty array for empty content', async () => {
    const chunks = await chunkDocument(_doc(''));
    expect(chunks).toHaveLength(0);
  });

  it('preserves source in metadata', async () => {
    const chunks = await chunkDocument(_doc('# Hello', 'docs/readme.md'));
    expect(chunks[0].metadata.source).toBe('docs/readme.md');
  });

  it('assigns sequential chunkIndex starting from 0', async () => {
    const longContent = 'word '.repeat(2000);
    const chunks = await chunkDocument(_doc(longContent));
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((chunk, i) => {
      expect(chunk.metadata.chunkIndex).toBe(i);
    });
  });

  it('every chunk has non-empty content', async () => {
    const chunks = await chunkDocument(_doc('# Hello\n\nSome content here.'));
    for (const chunk of chunks) {
      expect(chunk.content.length).toBeGreaterThan(0);
    }
  });

  it('returns empty array for whitespace-only content', async () => {
    const chunks = await chunkDocument(_doc('   \n\n   \t  '));
    expect(chunks).toHaveLength(0);
  });

  it('handles very long word without spaces as single chunk', async () => {
    const longWord = 'a'.repeat(500);
    const chunks = await chunkDocument(_doc(longWord));
    expect(chunks.length).toBeGreaterThan(0);
    const reconstructed = chunks.map((c) => c.content).join('');
    expect(reconstructed).toContain(longWord.slice(0, 100));
  });
});
