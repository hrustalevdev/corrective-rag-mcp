# MiniSearch BM25 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the custom BM25 implementation with MiniSearch, fixing Cyrillic tokenization and encapsulating the index in a class.

**Architecture:** `BM25Index` class wraps a MiniSearch instance and exposes two methods — `update(chunks)` rebuilds the index, `search(query, topK)` queries it. A module-level singleton `bm25` is exported. `indexer.ts` calls `bm25.update()` after indexing; `hybrid.ts` calls `bm25.search()` for BM25 results.

**Tech Stack:** [minisearch](https://github.com/lucaong/minisearch) (BM25+, Unicode-aware tokenizer, TypeScript types included)

## Global Constraints

- Run `npm run check` before finishing — Biome enforces 2-space indent, single quotes, semicolons, trailing commas, line width 100, `node:` prefix for built-ins
- Never use `console.log` — MCP uses stdio; all logging goes to `console.error`
- TDD: write failing test → watch it fail → implement → watch it pass
- Test files live in `__tests__/` next to their module
- Do NOT run `git commit` — the user reviews and commits

---

### Task 1: Rewrite `bm25.ts` as `BM25Index` class backed by MiniSearch

**Files:**
- Modify: `src/retriever/bm25.ts` — full rewrite
- Modify: `src/retriever/__tests__/bm25.test.ts` — rewrite to use class API + add Cyrillic test

**Interfaces:**
- Produces:
  ```typescript
  export interface BM25Result {
    content: string;
    metadata: Record<string, string | number>;
    score: number;
  }
  export class BM25Index {
    update(chunks: Chunk[]): void
    search(query: string, topK: number): BM25Result[]
  }
  export const bm25: BM25Index
  ```

- [ ] **Step 1: Install MiniSearch**

```bash
npm install minisearch
```

Expected: `minisearch` appears in `package.json` dependencies.

- [ ] **Step 2: Rewrite `bm25.test.ts` with failing tests**

Replace the entire file `src/retriever/__tests__/bm25.test.ts`:

```typescript
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
    const chunks = [_chunk('elves in forest', 'test.md', 0), _chunk('dragon breathes fire', 'test.md', 1)];
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
```

- [ ] **Step 3: Run tests — confirm RED**

```bash
npx vitest run src/retriever/__tests__/bm25.test.ts
```

Expected: FAIL — `bm25` does not have `update`/`search` methods.

- [ ] **Step 4: Rewrite `bm25.ts`**

Replace the entire file `src/retriever/bm25.ts`:

```typescript
import MiniSearch from 'minisearch';
import type { Chunk } from '../indexer/chunker.js';

export interface BM25Result {
  content: string;
  metadata: Record<string, string | number>;
  score: number;
}

interface _Doc {
  id: string;
  content: string;
  source: string;
  extension: string;
  chunkIndex: number;
}

export class BM25Index {
  private _ms: MiniSearch<_Doc>;

  constructor() {
    this._ms = new MiniSearch<_Doc>({
      fields: ['content'],
      storeFields: ['content', 'source', 'extension', 'chunkIndex'],
      tokenize: (text) => text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [],
    });
  }

  update(chunks: Chunk[]): void {
    this._ms.removeAll();
    this._ms.addAll(
      chunks.map((c) => ({
        id: `${c.metadata.source}::${c.metadata.chunkIndex}`,
        content: c.content,
        source: c.metadata.source,
        extension: c.metadata.extension,
        chunkIndex: c.metadata.chunkIndex,
      })),
    );
  }

  search(query: string, topK: number): BM25Result[] {
    if (!query.trim()) return [];
    return this._ms
      .search(query)
      .slice(0, topK)
      .map((r) => ({
        content: r.content as string,
        metadata: {
          source: r.source as string,
          extension: r.extension as string,
          chunkIndex: r.chunkIndex as number,
        },
        score: r.score,
      }));
  }
}

export const bm25 = new BM25Index();
```

- [ ] **Step 5: Run tests — confirm GREEN**

```bash
npx vitest run src/retriever/__tests__/bm25.test.ts
```

Expected: 9 tests pass.

---

### Task 2: Wire `bm25.update()` into `indexer.ts`, remove `indexedChunks`

**Files:**
- Modify: `src/indexer/indexer.ts`

**Interfaces:**
- Consumes: `bm25.update(chunks: Chunk[]): void` from `src/retriever/bm25.ts`
- Produces: removes `export let indexedChunks: Chunk[]`

- [ ] **Step 1: Replace `src/indexer/indexer.ts`**

```typescript
import { bm25 } from '../retriever/bm25.js';
import type { ProgressTracker } from '../progress/tracker.js';
import { addChunks, resetCollection } from '../retriever/vector.js';
import { type Chunk, chunkDocument } from './chunker.js';
import { loadFilesFromFolder } from './loaders.js';

export type IndexStatus = 'empty' | 'indexing' | 'ready' | 'error';

interface IndexerState {
  status: IndexStatus;
  indexedFiles: number;
  indexedChunks: number;
  lastIndexedAt: string | null;
  folderPath: string | null;
  error?: string;
}

const state: IndexerState = {
  status: 'empty',
  indexedFiles: 0,
  indexedChunks: 0,
  lastIndexedAt: null,
  folderPath: null,
};

export async function indexFolder(
  folderPath: string,
  tracker?: ProgressTracker,
): Promise<IndexerState> {
  state.status = 'indexing';
  state.error = undefined;

  try {
    const docs = loadFilesFromFolder(folderPath);

    const allChunks: Chunk[] = [];
    for (const doc of docs) {
      const chunks = await chunkDocument(doc);
      allChunks.push(...chunks);
    }

    await resetCollection();
    await addChunks(allChunks, tracker);
    bm25.update(allChunks);
    tracker?.onDone(allChunks.length);

    state.indexedFiles = docs.length;
    state.indexedChunks = allChunks.length;
    state.lastIndexedAt = new Date().toISOString();
    state.folderPath = folderPath;
    state.status = 'ready';
  } catch (err) {
    tracker?.onError(err);
    state.status = 'error';
    state.error = err instanceof Error ? err.message : String(err);
    state.indexedFiles = 0;
    state.indexedChunks = 0;
    bm25.update([]);
  }

  return { ...state };
}

export function getStatus(): IndexerState {
  return { ...state };
}
```

---

### Task 3: Update `hybrid.ts` and `hybrid.test.ts`

**Files:**
- Modify: `src/retriever/hybrid.ts`
- Modify: `src/retriever/__tests__/hybrid.test.ts`

**Interfaces:**
- Consumes: `bm25.search(query: string, topK: number): BM25Result[]` from `src/retriever/bm25.ts`

- [ ] **Step 1: Replace `src/retriever/hybrid.ts`**

```typescript
import { bm25, type BM25Result } from './bm25.js';
import { queryChunks, type VectorResult } from './vector.js';

export interface HybridResult {
  content: string;
  metadata: Record<string, string | number>;
  score: number;
  rank: number;
}

const RRF_K = 60;

export function rrfFusion(
  bm25Results: BM25Result[],
  vectorResults: VectorResult[],
  topK: number,
): HybridResult[] {
  const scores = new Map<string, { score: number; metadata: Record<string, string | number> }>();

  const _addList = (
    items: Array<{ content: string; metadata: Record<string, string | number> }>,
  ) => {
    items.forEach((item, rank) => {
      const rrfScore = 1 / (RRF_K + rank + 1);
      const existing = scores.get(item.content);
      if (existing) {
        existing.score += rrfScore;
      } else {
        scores.set(item.content, { score: rrfScore, metadata: item.metadata });
      }
    });
  };

  _addList(bm25Results);
  _addList(vectorResults.map((r) => ({ content: r.content, metadata: r.metadata })));

  return Array.from(scores.entries())
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, topK)
    .map(([content, { score, metadata }], i) => ({ content, metadata, score, rank: i + 1 }));
}

export async function hybridSearch(query: string, topK: number): Promise<HybridResult[]> {
  const fetchK = topK * 2;
  const [bm25Results, vectorResults] = await Promise.all([
    Promise.resolve(bm25.search(query, fetchK)),
    queryChunks(query, fetchK),
  ]);
  return rrfFusion(bm25Results, vectorResults, topK);
}
```

- [ ] **Step 2: Update `src/retriever/__tests__/hybrid.test.ts` — remove indexer mock**

Remove line 4: `vi.mock('../../indexer/indexer.js', () => ({ indexedChunks: [] }));`

Result — file should start with:

```typescript
import { describe, expect, it, vi } from 'vitest';

vi.mock('../vector.js', () => ({ queryChunks: vi.fn() }));

import type { BM25Result } from '../bm25.js';
import { rrfFusion } from '../hybrid.js';
import type { VectorResult } from '../vector.js';
```

- [ ] **Step 3: Run all tests — confirm GREEN**

```bash
npx vitest run
```

Expected: 44 tests pass (42 предыдущих + 2 новых: Cyrillic + replace index).

- [ ] **Step 4: Build check**

```bash
npm run build
```

Expected: clean compile, no errors.

- [ ] **Step 5: Biome check**

```bash
npm run check
```

Expected: 0 errors.
