# Corrective RAG MCP — Living Implementation Plan

> **Для агентов:** Читай этот файл в начале каждой итерации. Он содержит полное состояние проекта, что сделано и что делать дальше. После завершения итерации — обнови этот файл.

---

## Цель проекта

MCP-сервер на Node.js/TypeScript, который превращает локальную папку с документами в поисковую базу знаний. Использует Corrective RAG (LangGraph) с локальной LLM через Ollama.

## Стек технологий

| Роль | Технология |
|------|-----------|
| MCP сервер | `@modelcontextprotocol/sdk` (TypeScript SDK, stdio transport) |
| Граф / оркестрация | `@langchain/langgraph` |
| LLM (Ollama) | `@langchain/ollama` |
| Векторное хранилище | `chromadb` клиент → ChromaDB сервис в Docker |
| BM25 | `@langchain/community` BM25Retriever |
| Тесты | `vitest` |
| Docker | Dockerfile + docker-compose.yml (server + chromadb + ollama) |

## Структура файлов (финальная)

```
corrective-rag-mcp/
├── src/
│   ├── index.ts              ← точка входа, запуск MCP сервера
│   ├── server.ts             ← регистрация 4 инструментов
│   ├── config.ts             ← конфиг из env-переменных
│   ├── tools/
│   │   ├── index-folder.ts
│   │   ├── ask-question.ts
│   │   ├── find-relevant.ts
│   │   └── index-status.ts
│   ├── indexer/
│   │   ├── indexer.ts        ← координирует индексацию, хранит статус
│   │   ├── loaders.ts        ← загрузка файлов по расширению
│   │   └── chunker.ts        ← разбивка на чанки (текст/код)
│   ├── retriever/
│   │   ├── hybrid.ts         ← гибридный поиск + RRF fusion
│   │   ├── bm25.ts           ← BM25 ретривер
│   │   └── vector.ts         ← векторный ретривер (ChromaDB)
│   └── rag/
│       ├── state.ts          ← LangGraph state (Annotation.Root)
│       ├── nodes.ts          ← узлы графа
│       └── graph.ts          ← сборка графа, экспорт compiledGraph
├── tests/
│   ├── unit/
│   │   ├── graph.test.ts
│   │   └── indexer.test.ts
│   └── e2e/
│       └── mcp-tools.test.ts
├── sample_docs/              ← демо-документы (фэнтезийная игра)
│   ├── docs/     ← .md файлы
│   ├── notes/    ← .txt файлы
│   ├── config/   ← .yaml, .json файлы
│   └── src/      ← .js, .ts, .py файлы
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── mcp-config-example.json   ← пример конфига для подключения в VSCode Copilot
├── README.md
├── ARCHITECTURE.md
└── REPORT.md
```

## 4 MCP инструмента

| Инструмент | Описание |
|-----------|---------|
| `index_folder` | Сканирует папку, разбивает на чанки, создаёт эмбеддинги, сохраняет в ChromaDB |
| `ask_question` | Запускает полный Corrective RAG граф (LangGraph), возвращает ответ + источники |
| `find_relevant_docs` | Гибридный поиск BM25 + vector + RRF, возвращает чанки без генерации |
| `index_status` | Статистика: кол-во файлов, чанков, время последней индексации |

## LangGraph граф (Corrective RAG)

```
User Query
  → rewrite_query (LLM переформулирует запрос)
  → retrieve (BM25 + vector + RRF)
  → grade_chunks (LLM оценивает каждый чанк: relevant/irrelevant)
  → [если достаточно релевантных] → generate_answer → DONE
  → [если мало релевантных, retry < 2] → broaden_query → retrieve → ...
  → [retry >= 2] → generate_answer с тем что есть → DONE
```

## Конфигурация (env-переменные)

```
OLLAMA_BASE_URL=http://localhost:11434  (или http://ollama:11434 в Docker)
OLLAMA_MODEL=qwen2.5:3b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
CHROMA_URL=http://localhost:8000        (или http://chromadb:8000 в Docker)
CHROMA_COLLECTION=rag_documents
MIN_RELEVANT_CHUNKS=2
MAX_RETRIEVE_RETRIES=2
```

---

## Итерации

### ✅ Итерация 0: Анализ и планирование
Статус: **ЗАВЕРШЕНА**
- Проект пустой, `src/index.ts` содержит заглушку
- `sample_docs/` содержит демо-документы (фэнтезийная игра)
- Создан этот план

---

### 🔲 Итерация 1: Scaffolding + MCP скелет

**Цель:** MCP сервер стартует, 4 инструмента видны в MCP Inspector, возвращают заглушки.

**Статус:** НЕ НАЧАТА

**Файлы для создания:**
- `package.json` — обновить с зависимостями
- `tsconfig.json` — обновить (ESM, NodeNext)
- `src/config.ts` — конфиг из env
- `src/server.ts` — создание Server, регистрация инструментов
- `src/index.ts` — запуск через stdio
- `src/tools/index-folder.ts` — заглушка
- `src/tools/ask-question.ts` — заглушка
- `src/tools/find-relevant.ts` — заглушка
- `src/tools/index-status.ts` — заглушка

**Зависимости для установки:**
```
@modelcontextprotocol/sdk
zod
```
**Dev-зависимости:**
```
typescript @types/node vitest tsx
```

**Проверка:** `npx @modelcontextprotocol/inspector npx tsx src/index.ts` показывает 4 инструмента.

---

### 🔲 Итерация 2: Индексер документов

**Цель:** `index_folder` и `index_status` работают полностью.

**Статус:** НЕ НАЧАТА (зависит от Итерации 1)

**Файлы для создания:**
- `src/indexer/loaders.ts` — загрузка .md/.txt/.py/.js/.ts/.json/.yaml
- `src/indexer/chunker.ts` — RecursiveCharacterTextSplitter для текста, по функциям для кода
- `src/indexer/indexer.ts` — координация, хранение статуса в памяти
- `src/retriever/vector.ts` — ChromaDB клиент, add/query
- Обновить `src/tools/index-folder.ts`
- Обновить `src/tools/index-status.ts`

**Дополнительные зависимости:**
```
@langchain/core @langchain/community @langchain/ollama chromadb
```

**Проверка:** `index_folder("./sample_docs")` → `index_status()` показывает > 0 файлов и чанков.

---

### 🔲 Итерация 3: Гибридный поиск

**Цель:** `find_relevant_docs` работает (BM25 + vector + RRF).

**Статус:** НЕ НАЧАТА (зависит от Итерации 2)

**Файлы для создания:**
- `src/retriever/bm25.ts` — BM25 поиск по проиндексированным чанкам
- `src/retriever/hybrid.ts` — Reciprocal Rank Fusion (RRF) объединение результатов
- Обновить `src/tools/find-relevant.ts`

**Проверка:** `find_relevant_docs("dragon fire abilities", 5)` возвращает релевантные чанки.

---

### 🔲 Итерация 4: LangGraph Corrective RAG

**Цель:** `ask_question` работает с полным графом.

**Статус:** НЕ НАЧАТА (зависит от Итерации 3)

**Файлы для создания:**
- `src/rag/state.ts` — `Annotation.Root` с полями query, rewrittenQuery, chunks, relevantChunks, answer, retryCount, sources
- `src/rag/nodes.ts` — функции: rewriteQuery, retrieve, gradeChunks, generateAnswer, broadenQuery
- `src/rag/graph.ts` — StateGraph, условные переходы, компиляция
- Обновить `src/tools/ask-question.ts`

**Проверка:** `ask_question("What are the dragon abilities?")` возвращает ответ с источниками.

---

### 🔲 Итерация 5: Тесты

**Цель:** Минимум 10 тестов, все зелёные.

**Статус:** НЕ НАЧАТА (зависит от Итерации 4)

**Тесты:**
- `tests/unit/graph.test.ts` — 5+ тестов узлов графа с mock LLM
- `tests/unit/indexer.test.ts` — 3+ тестов индексера (загрузка файлов, чанки)
- `tests/e2e/mcp-tools.test.ts` — 2+ e2e тестов MCP инструментов

---

### 🔲 Итерация 6: Docker + CI + Документация

**Цель:** `docker compose up` запускает всё одной командой.

**Статус:** НЕ НАЧАТА (зависит от Итерации 5)

**Файлы для создания:**
- `Dockerfile`
- `docker-compose.yml` — services: app, chromadb, ollama
- `.env.example`
- `mcp-config-example.json`
- `.github/workflows/ci.yml` — lint + тесты
- `README.md`, `ARCHITECTURE.md`, `REPORT.md`

---

## Заметки по реализации

### Почему ChromaDB как отдельный сервис (не in-process)
В Python ChromaDB может работать встроенно. В Node.js только HTTP-клиент. Для Docker-деплоя это чисто — ChromaDB как отдельный контейнер.

### Формат ответа `ask_question`
```json
{
  "answer": "Dragons can use ...",
  "sources": ["sample_docs/docs/abilities-reference.md", "..."],
  "chunks_used": 3,
  "retries": 0
}
```

### Формат ответа `find_relevant_docs`
```json
{
  "chunks": [
    { "content": "...", "source": "file.md", "score": 0.87, "rank": 1 }
  ],
  "total": 5
}
```
