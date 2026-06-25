# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Run MCP server in MCP Inspector (requires .env file)
npm run build        # Compile TypeScript → dist/
npm run start        # Run compiled server (requires .env file)
npm run test         # Run all tests (vitest watch mode)
npx vitest run       # Run all tests once
npx vitest run src/indexer/__tests__/chunker.test.ts  # Run a single test file
npm run check        # Biome lint + format (writes fixes)
npm run lint         # Biome lint only
npm run format       # Biome format only
npm run test:index   # Live indexing test against real Ollama + ChromaDB
```

## Architecture

This is a **Node.js/TypeScript MCP server** implementing a Corrective RAG pipeline. It exposes 4 tools to MCP clients (Claude, Copilot, etc.) via stdio transport.

### Request flow

```
MCP client → src/index.ts (stdio transport)
           → src/server.ts (registerTool)
           → src/tools/*.ts (thin handlers)
               → src/indexer/ (for index_folder / index_status)
               → src/retriever/ (for find_relevant_docs)
               → src/rag/ (for ask_question)
```

### Module responsibilities

| Module | Role |
|--------|------|
| `src/server.ts` | Registers all 4 MCP tools with descriptions + Zod input schemas |
| `src/config.ts` | Parses all config from env vars via Zod; single `config` export |
| `src/tools/` | Thin handlers — call domain modules, format MCP response |
| `src/indexer/indexer.ts` | Coordinates load→chunk→embed→store; holds in-memory state |
| `src/indexer/loaders.ts` | Recursive folder scan, reads supported file extensions |
| `src/indexer/chunker.ts` | `RecursiveCharacterTextSplitter` with language-aware splitting |
| `src/retriever/vector.ts` | ChromaDB client + OllamaEmbeddings; singleton instances, batched at 50 |
| `src/retriever/bm25.ts` | `BM25Index` class (MiniSearch, BM25+ k=1.5/b=0.75, Unicode tokenizer); singleton `bm25` |
| `src/retriever/hybrid.ts` | `hybridSearch()` — BM25 + vector in parallel, merged via private `_rrfFusion()` (RRF_K=60) |
| `src/rag/state.ts` | `Annotation.Root` — LangGraph state with 7 fields |
| `src/rag/nodes.ts` | `createNodes(llm)` factory — 5 RAG nodes (rewriteQuery, retrieve, gradeChunks, generateAnswer, broadenQuery) |
| `src/rag/graph.ts` | `StateGraph` assembly; `shouldContinue` router; `compiledGraph` singleton; `createGraph(llm?)` for tests |
| `src/progress/tracker.ts` | `ProgressTracker` — measures embedding batches, sends MCP progress notifications |

See `docs/plan.md` for the full iteration plan and `ARCHITECTURE.md` for detailed diagrams.

### External services required at runtime

| Service | Default URL | Purpose |
|---------|-------------|---------|
| Ollama | `http://localhost:11434` | LLM inference + embeddings |
| ChromaDB | `http://localhost:8000` | Vector store (HTTP client only in Node.js) |

**On Mac: use native Ollama, not Docker.** Docker on Mac runs through a Linux VM without Metal/Neural Engine access — embedding throughput is ~16× slower (~384 tok/s vs ~6300 tok/s with native Ollama).

### Configuration

All config comes from env vars, validated at startup in `src/config.ts`. Copy `.env.example` → `.env`.

Required vars: `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `OLLAMA_EMBEDDING_MODEL`, `CHROMA_URL`, `CHROMA_COLLECTION`, `MIN_RELEVANT_CHUNKS`, `MAX_RETRIEVE_RETRIES`.

### Code conventions

- **stdout is sacred** — MCP uses stdio transport. Never `console.log` in production code; use `console.error` for debug output (goes to stderr, visible in MCP Inspector).
- **Node.js built-ins** use `node:` prefix (`node:fs`, `node:path`).
- **Private helpers** go under a `// HELPERS` comment with `_` prefix (e.g. `_getClient()`).
- **Biome** enforces style: 2-space indent, single quotes, semicolons, trailing commas, line width 100. Run `npm run check` before committing.
- **`ProgressTracker`** — create one instance per tool call in `server.ts`, pass it down the call chain. Per-call lifecycle means no reset needed.
- **MCP SDK**: use `server.registerTool()` (v2 API). The older `server.tool()` is deprecated and triggers warnings in MCP Inspector.

### RAG nodes design

- **`createNodes(llm: ChatOllama)`** — factory, injects LLM; enables unit testing with fake LLM
- **`gradeChunks`** — all LLM calls via `Promise.all` (parallel, latency = single call)
- **`shouldContinue`** — exported (not a `_`-helper) so it can be unit-tested directly
- **`compiledGraph`** — module-level singleton created at import time; `createGraph(llm?)` for tests
- Prompts in **English** — qwen2.5:3b follows EN instructions more reliably; understands Russian content

### Tests

Tests live in `__tests__/` subdirectories next to their modules (Vitest convention). Currently 49 unit tests across 6 files: `loaders`, `chunker`, `ProgressTracker`, `bm25`, `rag/nodes`, `rag/graph` — all pure modules with no external dependencies. Integration and e2e tests are planned for Iteration 6.
