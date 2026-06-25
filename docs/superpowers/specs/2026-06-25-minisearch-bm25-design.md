# Design: Replace custom BM25 with MiniSearch

**Date:** 2026-06-25  
**Status:** Approved

## Problem

The custom BM25 implementation in `src/retriever/bm25.ts` uses `\w+` regex for tokenization, which does not match Cyrillic characters. Russian-language documents produce zero BM25 results. Additionally, the implementation re-indexes all chunks on every search call, which is inefficient.

## Solution

Replace `bm25.ts` with a `BM25Index` class backed by [MiniSearch](https://github.com/lucaong/minisearch) — a battle-tested in-memory full-text search engine using BM25+. MiniSearch tokenizes on Unicode boundaries (`\p{L}\p{N}`), handling Cyrillic out of the box.

## Architecture

### `src/retriever/bm25.ts` — full rewrite

```typescript
export interface BM25Result {
  content: string;
  metadata: Record<string, string | number>;
  score: number;
}

export class BM25Index {
  private _ms: MiniSearch<...>;

  constructor() {
    this._ms = new MiniSearch({
      fields: ['content'],
      storeFields: ['content', 'source', 'extension', 'chunkIndex'],
      tokenize: (text) => text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [],
    });
  }

  // Rebuilds the index from scratch. Called once after index_folder completes.
  update(chunks: Chunk[]): void {
    this._ms.removeAll();
    this._ms.addAll(chunks.map((c) => ({
      id: `${c.metadata.source}::${c.metadata.chunkIndex}`,
      content: c.content,
      source: c.metadata.source,
      extension: c.metadata.extension,
      chunkIndex: c.metadata.chunkIndex,
    })));
  }

  // Returns top-K BM25 results. Returns [] if index is empty or query is empty.
  search(query: string, topK: number): BM25Result[] { ... }
}

export const bm25 = new BM25Index(); // singleton, same pattern as vector.ts singletons
```

Document ID: `${source}::${chunkIndex}` — consistent with ChromaDB IDs in `vector.ts`.

### `src/indexer/indexer.ts` — small change

After `addChunks(allChunks, tracker)`, add:
```typescript
bm25.update(allChunks);
```

Remove the `export let indexedChunks: Chunk[]` export — no longer needed.

### `src/retriever/hybrid.ts` — small change

```typescript
// Remove: import { indexedChunks } from '../indexer/indexer.js';
// Remove: import { type BM25Result, bm25Search } from './bm25.js';
// Add:
import { bm25, type BM25Result } from './bm25.js';

// In hybridSearch:
// Before: bm25Search(query, indexedChunks, fetchK)
// After:
bm25.search(query, fetchK)
```

`rrfFusion` signature and `HybridResult` type — unchanged.

## Tests

### `src/retriever/__tests__/bm25.test.ts` — rewrite

Tests call `bm25.update([...chunks])` before each search. New test added: Cyrillic query on Cyrillic content returns results.

Behavioral contract (same as before):
- empty chunks → empty results
- empty query → empty results
- matching terms → non-empty results, relevant chunk ranked first
- topK limit respected
- positive scores
- non-matching chunks excluded
- **new:** Cyrillic text is searchable

### `src/retriever/__tests__/hybrid.test.ts` — small change

Remove `vi.mock('../../indexer/indexer.js', ...)` — `hybrid.ts` no longer imports from indexer. The mock for `vector.js` stays (needs env vars).

## Files changed

| File | Change |
|------|--------|
| `src/retriever/bm25.ts` | Full rewrite → `BM25Index` class + `bm25` singleton |
| `src/indexer/indexer.ts` | Add `bm25.update(allChunks)`, remove `indexedChunks` export |
| `src/retriever/hybrid.ts` | Use `bm25.search(query, fetchK)` instead of `bm25Search(query, indexedChunks, fetchK)` |
| `src/retriever/__tests__/bm25.test.ts` | Rewrite: call `bm25.update()` before search, add Cyrillic test |
| `src/retriever/__tests__/hybrid.test.ts` | Remove indexer mock |

## Dependencies

```bash
npm install minisearch
```

MiniSearch ships TypeScript types — no `@types/minisearch` needed.
