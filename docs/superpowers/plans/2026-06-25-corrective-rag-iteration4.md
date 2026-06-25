# LangGraph Corrective RAG (Iteration 4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the `ask_question` MCP tool as a full LangGraph Corrective RAG pipeline — rewrite → retrieve → grade → generate, with automatic retry via query broadening (up to MAX_RETRIEVE_RETRIES times).

**Architecture:** A `StateGraph` with 5 nodes compiled as a singleton `compiledGraph`. Nodes receive an injected `ChatOllama` via `createNodes(llm)` factory — enabling unit testing with a fake LLM. The routing function `shouldContinue` is exported separately for direct unit testing. `gradeChunks` evaluates all chunks in parallel via `Promise.all`.

**Tech Stack:** `@langchain/langgraph` (new), `@langchain/ollama` (already installed), `vitest` for TDD.

## Global Constraints

- Biome: 2-space indent, single quotes, semicolons, trailing commas, line width 100 — run `npm run check` before finishing each task
- Node.js built-ins use `node:` prefix (e.g., `node:fs`, `node:path`)
- Never `console.log` in production code — use `console.error` for debug output only
- Private helpers: `// HELPERS` comment + `_` prefix — `shouldContinue` is NOT a helper, it is exported for tests
- Tests live in `__tests__/` subdirectory next to the module (Vitest convention)
- TDD: write failing test first, verify it fails for the right reason, then implement
- Do NOT commit — the user reviews and commits manually

---

### Task 1: Install dependency + create state.ts

**Files:**
- Modify: `package.json` (npm install adds automatically)
- Create: `src/rag/state.ts`

**Interfaces:**
- Produces:
  - `interface RelevantChunk { content: string; source: string; }` — used by Tasks 2, 3, 4
  - `const RagState` (Annotation.Root) — used by Tasks 3, 4
  - `type RagStateType = typeof RagState.State` — used by Tasks 2, 3

- [ ] **Step 1: Install @langchain/langgraph**

```bash
npm install @langchain/langgraph
```

Expected: `@langchain/langgraph` added to `dependencies` in `package.json`.

- [ ] **Step 2: Create src/rag/state.ts**

```typescript
import { Annotation } from '@langchain/langgraph';
import type { HybridResult } from '../retriever/hybrid.js';

export interface RelevantChunk {
  content: string;
  source: string;
}

export const RagState = Annotation.Root({
  query: Annotation<string>(),
  rewrittenQuery: Annotation<string>({ default: () => '' }),
  chunks: Annotation<HybridResult[]>({ default: () => [] }),
  relevantChunks: Annotation<RelevantChunk[]>({ default: () => [] }),
  answer: Annotation<string>({ default: () => '' }),
  retryCount: Annotation<number>({ default: () => 0 }),
  sources: Annotation<string[]>({ default: () => [] }),
});

export type RagStateType = typeof RagState.State;
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npm run build
```

Expected: clean build, no errors.

---

### Task 2: TDD — nodes.ts

**Files:**
- Create: `src/rag/__tests__/nodes.test.ts`
- Create: `src/rag/nodes.ts`

**Interfaces:**
- Consumes:
  - `RagStateType`, `RelevantChunk` from `'./state.js'`
  - `HybridResult`, `hybridSearch` from `'../retriever/hybrid.js'`
  - `ChatOllama` from `'@langchain/ollama'`
- Produces:
  - `createNodes(llm: ChatOllama): { rewriteQuery, retrieve, gradeChunks, generateAnswer, broadenQuery }` — used by Task 3

Each node signature: `(state: RagStateType) => Promise<Partial<RagStateType>>`

- [ ] **Step 1: Create src/rag/__tests__/nodes.test.ts (failing tests)**

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChatOllama } from '@langchain/ollama';
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
```

- [ ] **Step 2: Run tests — verify they fail for the right reason**

```bash
npx vitest run src/rag/__tests__/nodes.test.ts
```

Expected: FAIL with `Cannot find module '../nodes.js'`

- [ ] **Step 3: Create src/rag/nodes.ts**

```typescript
import type { ChatOllama } from '@langchain/ollama';
import { hybridSearch } from '../retriever/hybrid.js';
import type { HybridResult } from '../retriever/hybrid.js';
import type { RagStateType, RelevantChunk } from './state.js';

const RETRIEVE_TOP_K = 5;

export function createNodes(llm: ChatOllama) {
  async function rewriteQuery(state: RagStateType): Promise<Partial<RagStateType>> {
    const prompt = `Rewrite the following user query to improve retrieval from a knowledge base.
Return ONLY the rewritten query, nothing else.
Original query: ${state.query}`;
    const response = await llm.invoke(prompt);
    return { rewrittenQuery: (response.content as string).trim() };
  }

  async function retrieve(state: RagStateType): Promise<Partial<RagStateType>> {
    const query = state.rewrittenQuery || state.query;
    const chunks = await hybridSearch(query, RETRIEVE_TOP_K);
    return { chunks };
  }

  async function gradeChunks(state: RagStateType): Promise<Partial<RagStateType>> {
    const query = state.rewrittenQuery || state.query;
    const grades = await Promise.all(
      state.chunks.map(async (chunk: HybridResult) => {
        const prompt = `Is the following document chunk relevant to answering the question?
Question: ${query}
Chunk: ${chunk.content}
Answer only "yes" or "no".`;
        const response = await llm.invoke(prompt);
        const answer = (response.content as string).trim().toLowerCase();
        return { chunk, relevant: answer.startsWith('yes') };
      }),
    );
    const relevantChunks: RelevantChunk[] = grades
      .filter((g) => g.relevant)
      .map((g) => ({
        content: g.chunk.content,
        source: (g.chunk.metadata.source as string) ?? '',
      }));
    return { relevantChunks };
  }

  async function generateAnswer(state: RagStateType): Promise<Partial<RagStateType>> {
    const query = state.rewrittenQuery || state.query;
    const chunksToUse: Array<{ content: string; source: string }> =
      state.relevantChunks.length > 0
        ? state.relevantChunks
        : state.chunks.map((c: HybridResult) => ({
            content: c.content,
            source: (c.metadata.source as string) ?? '',
          }));
    const sources = [...new Set(chunksToUse.map((c) => c.source))];
    const context = chunksToUse
      .map((c) => `Source: ${c.source}\n${c.content}`)
      .join('\n\n---\n\n');
    const prompt = `Answer the following question using ONLY the provided context chunks.
If the context does not contain sufficient information, say "I don't have enough information in the knowledge base to answer this question."

Question: ${query}

Context:
${context}`;
    const response = await llm.invoke(prompt);
    return { answer: (response.content as string).trim(), sources };
  }

  async function broadenQuery(state: RagStateType): Promise<Partial<RagStateType>> {
    const currentQuery = state.rewrittenQuery || state.query;
    const prompt = `The following search query returned insufficient relevant results from a knowledge base.
Create a broader version using synonyms, related terms, or more general language.
Return ONLY the new query, nothing else.
Original query: ${currentQuery}`;
    const response = await llm.invoke(prompt);
    return {
      rewrittenQuery: (response.content as string).trim(),
      retryCount: state.retryCount + 1,
    };
  }

  return { rewriteQuery, retrieve, gradeChunks, generateAnswer, broadenQuery };
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/rag/__tests__/nodes.test.ts
```

Expected: 7 tests PASS, 0 failures.

- [ ] **Step 5: Run Biome check**

```bash
npm run check
```

Expected: 0 errors, fixes applied in-place.

---

### Task 3: TDD — graph.ts

**Files:**
- Create: `src/rag/__tests__/graph.test.ts`
- Create: `src/rag/graph.ts`

**Interfaces:**
- Consumes:
  - `RagState`, `RagStateType` from `'./state.js'`
  - `createNodes` from `'./nodes.js'`
  - `ChatOllama` from `'@langchain/ollama'`
  - `config` from `'../config.js'` — reads `config.rag.minRelevantChunks`, `config.rag.maxRetrieveRetries`, `config.ollama.baseUrl`, `config.ollama.model`
  - `StateGraph`, `START`, `END` from `'@langchain/langgraph'`
- Produces:
  - `shouldContinue(state: RagStateType): 'generateAnswer' | 'broadenQuery'` — exported, used in tests and as router
  - `createGraph(llm?: ChatOllama)` — returns compiled `StateGraph`; used in tests to inject fake LLM
  - `compiledGraph` — module-level singleton created by `createGraph()`; imported by `ask-question.ts`

- [ ] **Step 1: Create src/rag/__tests__/graph.test.ts (failing tests)**

```typescript
import { describe, expect, it, vi } from 'vitest';

vi.mock('@langchain/ollama', () => ({
  ChatOllama: vi.fn().mockImplementation(() => ({ invoke: vi.fn() })),
}));
vi.mock('../../retriever/hybrid.js', () => ({ hybridSearch: vi.fn() }));
vi.mock('../../config.js', () => ({
  config: {
    rag: { minRelevantChunks: 2, maxRetrieveRetries: 2 },
    ollama: { model: 'test-model', baseUrl: 'http://localhost:11434' },
    chroma: { url: 'http://localhost:8000', collection: 'test' },
  },
}));

import { shouldContinue } from '../graph.js';

const _state = (relevantChunks: Array<{ content: string; source: string }>, retryCount: number) => ({
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
    const state = _state([{ content: 'a', source: 's' }, { content: 'b', source: 's' }], 0);
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
```

- [ ] **Step 2: Run tests — verify they fail for the right reason**

```bash
npx vitest run src/rag/__tests__/graph.test.ts
```

Expected: FAIL with `Cannot find module '../graph.js'`

- [ ] **Step 3: Create src/rag/graph.ts**

```typescript
import { END, START, StateGraph } from '@langchain/langgraph';
import { ChatOllama } from '@langchain/ollama';
import { config } from '../config.js';
import { createNodes } from './nodes.js';
import { RagState } from './state.js';
import type { RagStateType } from './state.js';

export function shouldContinue(state: RagStateType): 'generateAnswer' | 'broadenQuery' {
  const enough = state.relevantChunks.length >= config.rag.minRelevantChunks;
  const exhausted = state.retryCount >= config.rag.maxRetrieveRetries;
  return enough || exhausted ? 'generateAnswer' : 'broadenQuery';
}

export function createGraph(llm?: ChatOllama) {
  const model =
    llm ??
    new ChatOllama({
      baseUrl: config.ollama.baseUrl,
      model: config.ollama.model,
    });
  const nodes = createNodes(model);

  return new StateGraph(RagState)
    .addNode('rewriteQuery', nodes.rewriteQuery)
    .addNode('retrieve', nodes.retrieve)
    .addNode('gradeChunks', nodes.gradeChunks)
    .addNode('generateAnswer', nodes.generateAnswer)
    .addNode('broadenQuery', nodes.broadenQuery)
    .addEdge(START, 'rewriteQuery')
    .addEdge('rewriteQuery', 'retrieve')
    .addEdge('retrieve', 'gradeChunks')
    .addConditionalEdges('gradeChunks', shouldContinue, ['generateAnswer', 'broadenQuery'])
    .addEdge('broadenQuery', 'retrieve')
    .addEdge('generateAnswer', END)
    .compile();
}

export const compiledGraph = createGraph();
```

- [ ] **Step 4: Run graph tests — verify they pass**

```bash
npx vitest run src/rag/__tests__/graph.test.ts
```

Expected: 4 tests PASS.

- [ ] **Step 5: Run all tests — verify no regressions**

```bash
npx vitest run
```

Expected: all tests PASS (37 previous + 11 new = 48 total).

- [ ] **Step 6: Run Biome check**

```bash
npm run check
```

Expected: 0 errors.

---

### Task 4: Update ask-question.ts + full verification

**Files:**
- Modify: `src/tools/ask-question.ts`

**Interfaces:**
- Consumes: `compiledGraph` from `'../rag/graph.js'`
  - `compiledGraph.invoke({ query: string })` → `Promise<{ answer: string; sources: string[]; relevantChunks: RelevantChunk[]; retryCount: number }>`

- [ ] **Step 1: Replace src/tools/ask-question.ts**

```typescript
import { compiledGraph } from '../rag/graph.js';

export async function handleAskQuestion(
  question: string,
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const result = await compiledGraph.invoke({ query: question });
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          answer: result.answer,
          sources: result.sources,
          chunks_used: result.relevantChunks.length,
          retries: result.retryCount,
        }),
      },
    ],
  };
}
```

- [ ] **Step 2: Build the project**

```bash
npm run build
```

Expected: clean TypeScript build, no errors.

- [ ] **Step 3: Run all tests**

```bash
npx vitest run
```

Expected: 48 tests PASS.

- [ ] **Step 4: Biome check**

```bash
npm run check
```

Expected: 0 errors, 0 warnings.

---

### Task 5: Update docs/plan.md

**Files:**
- Modify: `docs/plan.md`

- [ ] **Step 1: In docs/plan.md, replace the Iteration 4 block**

Find:
```
### 🔲 Итерация 4: LangGraph Corrective RAG

**Цель:** `ask_question` работает с полным графом.

**Статус:** НЕ НАЧАТА (зависит от Итерации 3)
```

Replace with:
```markdown
### ✅ Итерация 4: LangGraph Corrective RAG

**Цель:** `ask_question` работает с полным графом.

**Статус:** ЗАВЕРШЕНА

**Что сделано:**
- `src/rag/state.ts` — `Annotation.Root` с полями: query, rewrittenQuery, chunks, relevantChunks, answer, retryCount, sources
- `src/rag/nodes.ts` — `createNodes(llm: ChatOllama)` фабрика; узлы: rewriteQuery, retrieve, gradeChunks (Promise.all параллельно), generateAnswer (fallback на все chunks), broadenQuery
- `src/rag/graph.ts` — `StateGraph` с условными переходами через `shouldContinue`; синглтон `compiledGraph`; `createGraph(llm?)` для тестов
- `src/tools/ask-question.ts` — вызывает `compiledGraph.invoke({ query })`, возвращает `{ answer, sources, chunks_used, retries }`
- Тесты: `src/rag/__tests__/nodes.test.ts` (7 тестов), `src/rag/__tests__/graph.test.ts` (4 теста) — итого +11, всего 48

**Важные выводы (для следующего агента):**
- Промпты на английском — qwen2.5:3b надёжнее следует EN инструкциям, понимает русский контент
- `gradeChunks` использует `Promise.all` — параллельные вызовы LLM, latency как у одного вызова
- `shouldContinue` экспортируется (не `_`-хелпер) — нужен для unit-тестов роутинга
- `compiledGraph` — синглтон, создаётся при импорте `graph.ts`; `createGraph(llm?)` — для тестов с инжектированным LLM
- `gradeChunks` парсит ответ через `.startsWith('yes')` — надёжно для small local LLM
```
