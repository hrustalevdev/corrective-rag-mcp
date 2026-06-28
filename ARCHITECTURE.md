# Architecture

Node.js/TypeScript MCP server implementing a Corrective RAG pipeline. Exposes 4 tools to MCP clients (Claude, Copilot, etc.) via stdio transport.

## Request Flow

```mermaid
flowchart TD
    Client["🖥️ MCP Client\n(Claude / Copilot)"] -->|"stdio JSON-RPC"| Index["src/index.ts\nStdioServerTransport"]
    Index --> Server["src/server.ts\nregisterTool × 4"]

    Server -->|"index_folder"| IF["src/tools/index-folder.ts"]
    Server -->|"index_status"| IS["src/tools/index-status.ts"]
    Server -->|"find_relevant_docs"| FR["src/tools/find-relevant.ts"]
    Server -->|"ask_question"| AQ["src/tools/ask-question.ts"]

    IF --> Indexer["src/indexer/indexer.ts"]
    IS --> Indexer
    FR --> Hybrid["src/retriever/hybrid.ts"]
    AQ --> Graph["src/rag/graph.ts\ncreateGraph()"]

    Indexer --> Loaders["src/indexer/loaders.ts"]
    Indexer --> Chunker["src/indexer/chunker.ts"]
    Indexer --> Vector["src/retriever/vector.ts"]

    Hybrid --> BM25["src/retriever/bm25.ts\nMiniSearch BM25+"]
    Hybrid --> Vector

    Graph --> Nodes["src/rag/nodes.ts\ncreateNodes(llm)"]
    Nodes --> Hybrid
    Nodes --> Ollama["🤖 Ollama\nLLM + embeddings"]
    Vector --> ChromaDB["🗄️ ChromaDB\nvector store"]
    Vector --> Ollama
```

## Module Responsibilities

| Module | Role |
|--------|------|
| `src/index.ts` | Entry point, starts MCP server via StdioServerTransport |
| `src/server.ts` | Registers 4 MCP tools with Zod schemas and descriptions |
| `src/config.ts` | Parses all env vars via Zod; single `config` export |
| `src/tools/` | Thin handlers — call domain modules, format MCP response |
| `src/indexer/indexer.ts` | Coordinates load→chunk→embed→store; holds in-memory state |
| `src/indexer/loaders.ts` | Recursive folder scan, reads supported file extensions |
| `src/indexer/chunker.ts` | `RecursiveCharacterTextSplitter` with language-aware splitting |
| `src/indexer/summarizer.ts` | Generates one-sentence `domain_summary` from 15 random chunk samples via LLM |
| `src/retriever/vector.ts` | ChromaDB client + OllamaEmbeddings; singleton, batched at 50 |
| `src/retriever/bm25.ts` | `BM25Index` (MiniSearch, BM25+ k=1.5/b=0.75, Unicode tokenizer) |
| `src/retriever/hybrid.ts` | `hybridSearch()` — BM25 + vector in parallel, merged via RRF (k=60) |
| `src/rag/state.ts` | `Annotation.Root` — LangGraph state definition |
| `src/rag/nodes.ts` | `createNodes(llm, tracker?)` factory — 5 RAG nodes with progress notifications |
| `src/rag/graph.ts` | `StateGraph` assembly, `shouldContinue` router; `createGraph(llm?, tracker?)` per-call |
| `src/rag/prompts.ts` | Prompt templates — EN retrieval queries, responds in user's language |
| `src/progress/tracker.ts` | `ProgressTracker` — embedding batches + RAG step MCP progress notifications |

## Corrective RAG Graph

```mermaid
flowchart TD
    START([START]) --> RW["rewriteQuery\nLLM переформулирует запрос"]
    RW --> RT["retrieve\nhybridSearch top-5"]
    RT --> GR["gradeChunks\nLLM × N параллельно\nyes / no на каждый чанк"]
    GR --> SC{"shouldContinue"}

    SC -->|"enough ≥ MIN\nИЛИ retries исчерпаны"| GEN["generateAnswer\nLLM по релевантным чанкам\n(fallback: все чанки)"]
    SC -->|"мало + retries остались"| BQ["broadenQuery\nLLM расширяет запрос\nretryCount++"]

    BQ --> RT
    GEN --> END([END])
```

**Routing logic (`shouldContinue`):**

```mermaid
flowchart LR
    A{"relevantChunks.length\n≥ MIN_RELEVANT_CHUNKS?"} -->|да| GEN[generateAnswer]
    A -->|нет| B{"retryCount\n≥ MAX_RETRIEVE_RETRIES?"}
    B -->|да — лимит исчерпан| GEN
    B -->|нет — можно повторить| BRO[broadenQuery]
```

## Hybrid Search

```mermaid
flowchart LR
    Q[query] --> BM25["BM25Index\nMiniSearch, Unicode-токенайзер\nBM25+ k=1.5 / b=0.75"]
    Q --> VEC["ChromaDB\nOllamaEmbeddings\nbge-m3"]
    BM25 -->|"top fetchK"| RRF["RRF Fusion\n1/(k+rank), k=60"]
    VEC -->|"top fetchK"| RRF
    RRF -->|"top K"| OUT[ranked chunks]
```

`fetchK = topK × 2` — каждый ретривер возвращает больше кандидатов, RRF выбирает лучшие.

## Indexing Pipeline

```mermaid
sequenceDiagram
    participant Tool as index_folder
    participant Idx as indexer.ts
    participant Ldr as loaders.ts
    participant Chk as chunker.ts
    participant Vec as vector.ts
    participant Ollama as Ollama
    participant Chroma as ChromaDB

    Tool->>Idx: indexFolder(path, tracker)
    Idx->>Ldr: loadFolder(path)
    Ldr-->>Idx: LoadedDoc[]
    Idx->>Chk: chunkDocument(doc) × N
    Chk-->>Idx: Chunk[]
    Idx->>Vec: addChunks(chunks, tracker)
    Vec->>Ollama: embedDocuments (batches of 50)
    Ollama-->>Vec: embeddings[]
    Vec->>Chroma: upsert vectors
    Idx->>Idx: bm25.update(chunks)
    Idx-->>Tool: { files, chunks, duration }
```

## State Shape (LangGraph)

```mermaid
classDiagram
    class RagState {
        +string query
        +string rewrittenQuery
        +HybridResult[] chunks
        +RelevantChunk[] relevantChunks
        +string answer
        +number retryCount
        +string[] sources
    }
    class RelevantChunk {
        +string content
        +string source
    }
    class HybridResult {
        +string content
        +Record~string~ metadata
        +number score
        +number rank
    }
    RagState --> RelevantChunk : relevantChunks
    RagState --> HybridResult : chunks
```

## External Services

| Service | Default URL | Purpose |
|---------|------------|---------|
| Ollama | `http://localhost:11434` | LLM inference + embeddings |
| ChromaDB | `http://localhost:8000` | Vector store (HTTP client only in Node.js) |

**На Mac: нативный Ollama обязателен.** Docker на Mac работает без Metal/Neural Engine — эмбеддинги ~16× медленнее (~384 vs ~6300 tok/s).

## Conventions

- **stdout — священен.** MCP использует stdio transport. Никаких `console.log` в продакшн-коде; только `console.error` для debug.
- **Node.js built-ins** с префиксом `node:` (`node:fs`, `node:path`).
- **Приватные хелперы** под `// HELPERS` с `_` префиксом.
- **Biome:** 2 пробела, одинарные кавычки, точка с запятой, trailing commas, lineWidth 100.
- **`ProgressTracker`** — новый инстанс на каждый tool call в `server.ts`.
- **`createGraph(llm?, tracker?)`** — создаётся per-call (нет синглтона); `tracker` инжектируется для MCP progress notifications.
