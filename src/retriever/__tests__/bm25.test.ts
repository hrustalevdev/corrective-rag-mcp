import { describe, expect, it } from 'vitest';
import type { Chunk } from '../../indexer/chunker.js';
import { bm25 } from '../bm25.js';

const _chunk = (content: string, source = 'test.md', i = 0): Chunk => ({
  content,
  metadata: { source, extension: '.md', chunkIndex: i },
});

describe('BM25Index', () => {
  it('returns empty array when index is empty', () => {
    bm25.update([]);
    expect(bm25.search('dragon', 5)).toEqual([]);
  });

  it('returns empty array for empty query', () => {
    bm25.update([_chunk('dragon fire')]);
    expect(bm25.search('', 5)).toEqual([]);
  });

  it('returns chunks containing query terms', () => {
    const chunks = [
      _chunk('dragons breathe fire', 'a.md', 0),
      _chunk('elves live in forests', 'b.md', 0),
    ];
    bm25.update(chunks);
    const results = bm25.search('dragon fire', 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].content).toBe('dragons breathe fire');
  });

  it('ranks chunk with more keyword occurrences higher', () => {
    const chunks = [
      _chunk('dragon lives in cave', 'b.md', 0),
      _chunk('dragon dragon dragon breathes fire', 'a.md', 0),
    ];
    bm25.update(chunks);
    const results = bm25.search('dragon', 5);
    expect(results[0].content).toContain('dragon dragon dragon');
  });

  it('respects topK limit', () => {
    const chunks = Array.from({ length: 10 }, (_, i) => _chunk(`dragon ${i}`, `doc${i}.md`, 0));
    bm25.update(chunks);
    expect(bm25.search('dragon', 3).length).toBeLessThanOrEqual(3);
  });

  it('returns positive scores', () => {
    bm25.update([_chunk('dragon breathes fire')]);
    const results = bm25.search('dragon', 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].score).toBeGreaterThan(0);
  });

  it('excludes chunks with no matching terms', () => {
    const chunks = [
      _chunk('elves in forest', 'test.md', 0),
      _chunk('dragon breathes fire', 'test.md', 1),
    ];
    bm25.update(chunks);
    const results = bm25.search('dragon', 5);
    expect(results.every((r) => r.content.includes('dragon'))).toBe(true);
  });

  it('searches Cyrillic text', () => {
    bm25.update([
      _chunk('дракон дышит огнём', 'ru.md', 0),
      _chunk('эльфы живут в лесу', 'ru.md', 1),
    ]);
    const results = bm25.search('дракон', 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].content).toBe('дракон дышит огнём');
  });

  it('replaces index on second update', () => {
    bm25.update([_chunk('dragon breathes fire')]);
    bm25.update([_chunk('elves live in forests')]);
    expect(bm25.search('dragon', 5)).toHaveLength(0);
  });
});
