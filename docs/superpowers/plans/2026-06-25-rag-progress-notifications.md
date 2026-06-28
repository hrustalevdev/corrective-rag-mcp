# RAG Progress Notifications Implementation Plan

> **Status: IMPLEMENTED** (2026-06-25). All tasks completed. See Итерация 5.5 in `docs/PLAN.md` for summary.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add MCP progress notifications to the `ask_question` tool so that each LangGraph RAG node emits a progress message with step name, duration, and LLM tokens/sec.

**Architecture:** Extend `ProgressTracker` with two new methods (`wrapLlmCall`, `notifyRagStep`), inject an optional tracker into `createNodes(llm, tracker?)`, and wire `ctx` from `server.ts` → `handleAskQuestion` → `createGraph` (per-call, no singleton).

**Tech Stack:** TypeScript, LangGraph (`@langchain/langgraph`), Ollama (`@langchain/ollama`), MCP SDK (`@modelcontextprotocol/sdk`), Vitest.

## Global Constraints

- Never `console.log` in production code — only `console.error` (stdout is MCP transport).
- Node.js built-ins use `node:` prefix.
- Private helpers: `_` prefix, under `// HELPERS` comment.
- Biome style: 2-space indent, single quotes, semicolons, trailing commas, lineWidth 100.
- `tracker` parameter is always optional — existing call sites without tracker must still compile and work.
- Do NOT commit — user reviews and commits manually.
- Tests: run `npx vitest run` (not `npm run test` which is watch mode).
- All new tests follow TDD: write the failing test first, watch it fail, then implement.

---

### Task 1: Extend ProgressTracker — `wrapLlmCall` + `notifyRagStep`

**Files:**
- Modify: `src/progress/tracker.ts`
- Modify: `src/progress/__tests__/tracker.test.ts`

**Interfaces:**
- Produces:
  - `ProgressTracker.wrapLlmCall<T extends { response_metadata?: Record<string, unknown> }>(fn: () => Promise<T>): Promise<{ result: T; durationMs: number; tokensPerSec: number }>`
  - `ProgressTracker.notifyRagStep(message: string): void`

---

- [ ] **Step 1: Write 4 failing tests for `wrapLlmCall` and `notifyRagStep`**

Add a new `describe('wrapLlmCall', ...)` and `describe('notifyRagStep', ...)` block at the end of `src/progress/__tests__/tracker.test.ts`:

```typescript
describe('wrapLlmCall', () => {
  it('returns the wrapped function result', async () => {
    const tracker = new ProgressTracker();
    const fakeResult = { content: 'hello' };
    const fn = vi.fn().mockResolvedValue(fakeResult);
    const { result } = await tracker.wrapLlmCall(fn);
    expect(result).toBe(fakeResult);
  });

  it('computes tokensPerSec from Ollama response_metadata', async () => {
    const tracker = new ProgressTracker();
    const fakeResult = {
      content: 'hello',
      response_metadata: {
        eval_count: 100,
        eval_duration: 500_000_000, // 0.5 s in nanoseconds
      },
    };
    const { tokensPerSec } = await tracker.wrapLlmCall(vi.fn().mockResolvedValue(fakeResult));
    expect(tokensPerSec).toBe(200); // 100 / 0.5
  });

  it('returns tokensPerSec 0 when response_metadata is absent', async () => {
    const tracker = new ProgressTracker();
    const { tokensPerSec } = await tracker.wrapLlmCall(
      vi.fn().mockResolvedValue({ content: 'hello' }),
    );
    expect(tokensPerSec).toBe(0);
  });
});

describe('notifyRagStep', () => {
  it('logs the message to stderr', () => {
    const tracker = new ProgressTracker();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    tracker.notifyRagStep('Rewriting query...');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Rewriting query...'));
    spy.mockRestore();
  });

  it('sends MCP notification when progressToken is present', () => {
    const sendNotification = vi.fn().mockResolvedValue(undefined);
    const ctx = { _meta: { progressToken: 'tok42' }, sendNotification };
    const tracker = new ProgressTracker(ctx as Parameters<typeof ProgressTracker>[0]);
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    tracker.notifyRagStep('Grading 5 chunks...');
    expect(sendNotification).toHaveBeenCalledOnce();
    const notification = sendNotification.mock.calls[0][0];
    expect(notification.params.message).toBe('Grading 5 chunks...');
    expect(notification.params.progress).toBe(1);
    expect(notification.params.total).toBe(0);
    spy.mockRestore();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/progress/__tests__/tracker.test.ts
```

Expected: 4 new tests FAIL with `wrapLlmCall is not a function` / `notifyRagStep is not a function`.

- [ ] **Step 3: Add `_ragStep` field and the two new methods to `ProgressTracker`**

Open `src/progress/tracker.ts`. Add `private _ragStep = 0;` next to the other private fields, then add the two methods before `// HELPERS`:

```typescript
// after the existing private fields, before the constructor:
private _ragStep = 0;
```

Add `wrapLlmCall` and `notifyRagStep` as public methods after `onError`:

```typescript
async wrapLlmCall<T extends { response_metadata?: Record<string, unknown> }>(
  fn: () => Promise<T>,
): Promise<{ result: T; durationMs: number; tokensPerSec: number }> {
  const t0 = performance.now();
  const result = await fn();
  const durationMs = Math.round(performance.now() - t0);
  const meta = result.response_metadata;
  const evalCount = typeof meta?.eval_count === 'number' ? meta.eval_count : 0;
  const evalDuration = typeof meta?.eval_duration === 'number' ? meta.eval_duration : 0;
  const tokensPerSec = evalDuration > 0 ? Math.round(evalCount / (evalDuration / 1e9)) : 0;
  return { result, durationMs, tokensPerSec };
}

notifyRagStep(message: string): void {
  this._ragStep += 1;
  console.error(`[rag] ${message}`);
  this._notify?.(this._ragStep, 0, message);
}
```

The full updated `src/progress/tracker.ts` should look like this:

```typescript
import type { ProgressNotification } from '@modelcontextprotocol/sdk/types.js';

interface _BatchProgress {
  batch: number;
  totalBatches: number;
  chunksInBatch: number;
  elapsedMs: number;
  tokensPerSec: number;
}

interface _McpToolContext {
  _meta?: { progressToken?: string | number };
  sendNotification(n: ProgressNotification): Promise<void>;
}

export class ProgressTracker {
  private _totalMs = 0;
  private _totalWeightedTps = 0;
  private _currentBatch = 0;
  private _totalBatches = 0;
  private _ragStep = 0;
  private _notify?: (progress: number, total: number, message?: string) => void;

  constructor(mcpCtx?: _McpToolContext) {
    const progressToken = mcpCtx?._meta?.progressToken;

    if (mcpCtx !== undefined && progressToken !== undefined) {
      this._notify = (progress, total, message) => {
        mcpCtx
          .sendNotification({
            method: 'notifications/progress',
            params: {
              progressToken,
              progress,
              total,
              ...(message !== undefined ? { message } : {}),
            },
          })
          .catch(() => {});
      };
    }
  }

  measureBatch<T>(
    fn: (contents: string[]) => Promise<T>,
    { totalBatches }: { totalBatches: number },
  ): (contents: string[]) => Promise<T> {
    this._totalBatches = totalBatches;

    return async (contents) => {
      const batchNum = this._currentBatch + 1;
      const chars = contents.reduce((s, c) => s + c.length, 0);

      const t0 = performance.now();
      const result = await fn(contents);
      const elapsedMs = Math.round(performance.now() - t0);
      const tokensPerSec = elapsedMs > 0 ? Math.round(chars / 4 / (elapsedMs / 1000)) : 0;

      this._currentBatch += 1;

      this._onBatch({
        batch: batchNum,
        totalBatches: this._totalBatches,
        chunksInBatch: contents.length,
        elapsedMs,
        tokensPerSec,
      });

      return result;
    };
  }

  onDone(totalChunks: number): void {
    const avg = this._totalMs > 0 ? Math.round(this._totalWeightedTps / this._totalMs) : 0;
    console.error(
      `[indexer] done: ${totalChunks} chunks, ${(this._totalMs / 1000).toFixed(1)}s total, avg ~${avg} tok/s`,
    );
  }

  onError(err: unknown): void {
    const message = err instanceof Error ? err.message : String(err);
    const batchInfo =
      this._totalBatches > 0 ? ` after ${this._currentBatch}/${this._totalBatches} batches` : '';
    console.error(`[indexer] failed${batchInfo}: ${message}`);
  }

  async wrapLlmCall<T extends { response_metadata?: Record<string, unknown> }>(
    fn: () => Promise<T>,
  ): Promise<{ result: T; durationMs: number; tokensPerSec: number }> {
    const t0 = performance.now();
    const result = await fn();
    const durationMs = Math.round(performance.now() - t0);
    const meta = result.response_metadata;
    const evalCount = typeof meta?.eval_count === 'number' ? meta.eval_count : 0;
    const evalDuration = typeof meta?.eval_duration === 'number' ? meta.eval_duration : 0;
    const tokensPerSec = evalDuration > 0 ? Math.round(evalCount / (evalDuration / 1e9)) : 0;
    return { result, durationMs, tokensPerSec };
  }

  notifyRagStep(message: string): void {
    this._ragStep += 1;
    console.error(`[rag] ${message}`);
    this._notify?.(this._ragStep, 0, message);
  }

  // HELPERS

  private _onBatch(p: _BatchProgress): void {
    this._totalMs += p.elapsedMs;
    this._totalWeightedTps += p.tokensPerSec * p.elapsedMs;

    const msg = `batch ${p.batch}/${p.totalBatches} | ${p.chunksInBatch} chunks | ${p.elapsedMs}ms | ~${p.tokensPerSec} tok/s`;
    console.error(`[indexer] ${msg}`);
    this._notify?.(p.batch, p.totalBatches, msg);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/progress/__tests__/tracker.test.ts
```

Expected: all tests PASS (existing 11 + 5 new = 16 total).

---

### Task 2: Instrument `nodes.ts` — per-node progress notifications

**Files:**
- Modify: `src/rag/nodes.ts`
- Modify: `src/rag/__tests__/nodes.test.ts`

**Interfaces:**
- Consumes:
  - `ProgressTracker.wrapLlmCall(fn)` → `{ result, durationMs, tokensPerSec }` (from Task 1)
  - `ProgressTracker.notifyRagStep(message: string): void` (from Task 1)
- Produces:
  - `createNodes(llm: ChatOllama, tracker?: ProgressTracker)` — same return shape as before, tracker optional

---

- [ ] **Step 1: Write 1 failing test for tracker integration in nodes**

Add the following import and test to `src/rag/__tests__/nodes.test.ts`.

Add import at the top (after existing imports):
```typescript
import type { ProgressTracker } from '../../progress/tracker.js';
```

Add a new `describe` block after the existing `describe('createNodes', ...)` block (outside it, as a sibling):

```typescript
describe('createNodes with tracker', () => {
  it('calls notifyRagStep twice during rewriteQuery (start + end)', async () => {
    const llmInvoke2 = vi.fn().mockResolvedValue({ content: 'rewritten query' });
    const fakeLlm2 = { invoke: llmInvoke2 } as unknown as ChatOllama;
    const notifyRagStep = vi.fn();
    const wrapLlmCall = vi.fn().mockImplementation(async (fn: () => Promise<unknown>) => {
      const result = await fn();
      return { result, durationMs: 10, tokensPerSec: 100 };
    });
    const spyTracker = { notifyRagStep, wrapLlmCall } as unknown as ProgressTracker;
    const nodesWithTracker = createNodes(fakeLlm2, spyTracker);

    await nodesWithTracker.rewriteQuery({
      query: 'test query',
      rewrittenQuery: '',
      chunks: [],
      relevantChunks: [],
      answer: '',
      retryCount: 0,
      sources: [],
    });

    expect(notifyRagStep).toHaveBeenCalledTimes(2);
    expect(notifyRagStep).toHaveBeenNthCalledWith(1, 'Rewriting query...');
    expect(notifyRagStep).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('Query rewritten'),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/rag/__tests__/nodes.test.ts
```

Expected: the new test FAILS because `createNodes` doesn't accept a second argument yet.

- [ ] **Step 3: Rewrite `src/rag/nodes.ts` with tracker instrumentation**

Replace the entire file content:

```typescript
import type { ChatOllama } from '@langchain/ollama';
import type { ProgressTracker } from '../progress/tracker.js';
import type { HybridResult } from '../retriever/hybrid.js';
import { hybridSearch } from '../retriever/hybrid.js';
import type { RagStateType, RelevantChunk } from './state.js';

const RETRIEVE_TOP_K = 5;

export function createNodes(llm: ChatOllama, tracker?: ProgressTracker) {
  async function _callLlm(prompt: string) {
    if (!tracker) {
      const result = await llm.invoke(prompt);
      return { result, durationMs: 0, tokensPerSec: 0 };
    }
    return tracker.wrapLlmCall(() => llm.invoke(prompt));
  }

  async function rewriteQuery(state: RagStateType): Promise<Partial<RagStateType>> {
    tracker?.notifyRagStep('Rewriting query...');
    const prompt = `Rewrite the following user query to improve retrieval from a knowledge base.
Return ONLY the rewritten query, nothing else.
Original query: ${state.query}`;
    const { result, durationMs, tokensPerSec } = await _callLlm(prompt);
    const rewrittenQuery = (result.content as string).trim();
    tracker?.notifyRagStep(
      `Query rewritten (${durationMs}ms, ~${tokensPerSec} tok/s): "${rewrittenQuery}"`,
    );
    return { rewrittenQuery };
  }

  async function retrieve(state: RagStateType): Promise<Partial<RagStateType>> {
    const attempt = state.retryCount + 1;
    tracker?.notifyRagStep(`Retrieving documents (attempt ${attempt})...`);
    const query = state.rewrittenQuery || state.query;
    const chunks = await hybridSearch(query, RETRIEVE_TOP_K);
    tracker?.notifyRagStep(`Found ${chunks.length} chunks`);
    return { chunks };
  }

  async function gradeChunks(state: RagStateType): Promise<Partial<RagStateType>> {
    const query = state.rewrittenQuery || state.query;
    tracker?.notifyRagStep(`Grading ${state.chunks.length} chunks...`);
    const grades = await Promise.all(
      state.chunks.map(async (chunk: HybridResult) => {
        const prompt = `Is the following document chunk relevant to answering the question?
Question: ${query}
Chunk: ${chunk.content}
Answer only "yes" or "no".`;
        const { result, tokensPerSec } = await _callLlm(prompt);
        const answer = (result.content as string).trim().toLowerCase();
        return { chunk, relevant: answer.startsWith('yes'), tokensPerSec };
      }),
    );
    const relevantChunks: RelevantChunk[] = grades
      .filter((g) => g.relevant)
      .map((g) => ({
        content: g.chunk.content,
        source: (g.chunk.metadata.source as string) ?? '',
      }));
    const avgTps =
      grades.length > 0
        ? Math.round(grades.reduce((sum, g) => sum + g.tokensPerSec, 0) / grades.length)
        : 0;
    tracker?.notifyRagStep(
      `Relevant: ${relevantChunks.length}/${grades.length} chunks (~${avgTps} tok/s avg)`,
    );
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
    tracker?.notifyRagStep(`Generating answer from ${chunksToUse.length} chunks...`);
    const sources = [...new Set(chunksToUse.map((c) => c.source))];
    const context = chunksToUse
      .map((c) => `Source: ${c.source}\n${c.content}`)
      .join('\n\n---\n\n');
    const prompt = `Answer the following question using ONLY the provided context chunks.
If the context does not contain sufficient information, say "I don't have enough information in the knowledge base to answer this question."

Question: ${query}

Context:
${context}`;
    const { result, durationMs, tokensPerSec } = await _callLlm(prompt);
    tracker?.notifyRagStep(`Answer ready (${durationMs}ms, ~${tokensPerSec} tok/s)`);
    return { answer: (result.content as string).trim(), sources };
  }

  async function broadenQuery(state: RagStateType): Promise<Partial<RagStateType>> {
    const currentQuery = state.rewrittenQuery || state.query;
    tracker?.notifyRagStep(`Broadening query (retry ${state.retryCount + 1})...`);
    const prompt = `The following search query returned insufficient relevant results from a knowledge base.
Create a broader version using synonyms, related terms, or more general language.
Return ONLY the new query, nothing else.
Original query: ${currentQuery}`;
    const { result, durationMs, tokensPerSec } = await _callLlm(prompt);
    const rewrittenQuery = (result.content as string).trim();
    tracker?.notifyRagStep(
      `Query broadened (${durationMs}ms, ~${tokensPerSec} tok/s): "${rewrittenQuery}"`,
    );
    return { rewrittenQuery, retryCount: state.retryCount + 1 };
  }

  return { rewriteQuery, retrieve, gradeChunks, generateAnswer, broadenQuery };
}
```

- [ ] **Step 4: Run all nodes tests to verify they pass**

```bash
npx vitest run src/rag/__tests__/nodes.test.ts
```

Expected: all 9 tests PASS (8 existing + 1 new).

---

### Task 3: Wire tracker through `graph.ts`, `ask-question.ts`, `server.ts`

**Files:**
- Modify: `src/rag/graph.ts`
- Modify: `src/tools/ask-question.ts`
- Modify: `src/server.ts`

**Interfaces:**
- Consumes:
  - `createNodes(llm, tracker?)` from Task 2
- Produces:
  - `createGraph(llm?: ChatOllama, tracker?: ProgressTracker)` — `compiledGraph` singleton removed
  - `handleAskQuestion(question: string, tracker?: ProgressTracker)` — tracker optional

No new tests for this task — existing tests cover `shouldContinue` (graph.test.ts) and the full suite will verify nothing broke.

---

- [ ] **Step 1: Update `src/rag/graph.ts`** — add tracker param, remove singleton

Replace the entire file:

```typescript
import { END, START, StateGraph } from '@langchain/langgraph';
import { ChatOllama } from '@langchain/ollama';
import { config } from '../config.js';
import type { ProgressTracker } from '../progress/tracker.js';
import { createNodes } from './nodes.js';
import type { RagStateType } from './state.js';
import { RagState } from './state.js';

export function shouldContinue(state: RagStateType): 'generateAnswer' | 'broadenQuery' {
  const enough = state.relevantChunks.length >= config.rag.minRelevantChunks;
  const exhausted = state.retryCount >= config.rag.maxRetrieveRetries;
  return enough || exhausted ? 'generateAnswer' : 'broadenQuery';
}

export function createGraph(llm?: ChatOllama, tracker?: ProgressTracker) {
  const model =
    llm ?? new ChatOllama({ baseUrl: config.ollama.baseUrl, model: config.ollama.model });
  const nodes = createNodes(model, tracker);

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
```

- [ ] **Step 2: Update `src/tools/ask-question.ts`** — accept tracker, create graph per-call

Replace the entire file:

```typescript
import type { ProgressTracker } from '../progress/tracker.js';
import { createGraph } from '../rag/graph.js';

export async function handleAskQuestion(
  question: string,
  tracker?: ProgressTracker,
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const graph = createGraph(undefined, tracker);
  const result = await graph.invoke({ query: question });
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

- [ ] **Step 3: Update `src/server.ts`** — pass ctx to `handleAskQuestion`

Find the `ask_question` handler (last `server.registerTool` call). Change the handler from:

```typescript
    async ({ question }) => handleAskQuestion(question),
```

to:

```typescript
    async ({ question }, ctx) => handleAskQuestion(question, new ProgressTracker(ctx)),
```

`ProgressTracker` is already imported at the top of the file — no import change needed.

- [ ] **Step 4: Run full test suite to verify all 49 tests still pass**

```bash
npx vitest run
```

Expected: 49 existing + 6 new = **55 tests PASS**, 0 failures.

(Breakdown: tracker.test.ts 16, nodes.test.ts 9, graph.test.ts 4, loaders, chunker, bm25 unchanged.)

- [ ] **Step 5: Build to verify TypeScript compiles cleanly**

```bash
npm run build
```

Expected: no errors, `dist/` updated.

- [ ] **Step 6: Lint**

```bash
npm run check
```

Expected: no errors (Biome auto-fixes formatting in place).
