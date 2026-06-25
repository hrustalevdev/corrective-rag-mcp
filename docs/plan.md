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

### ✅ Итерация 1: Scaffolding + MCP скелет

**Цель:** MCP сервер стартует, 4 инструмента видны в MCP Inspector, возвращают заглушки.

**Статус:** ЗАВЕРШЕНА

**Что сделано:**
- `package.json` обновлён: scripts `build/start/dev/test`, зависимости установлены
- `tsconfig.json`: target ES2022, module commonjs, strict
- `src/config.ts` — конфиг из env (Ollama URL/model, Chroma URL, RAG параметры)
- `src/server.ts` — McpServer с 4 инструментами через `registerTool` (v2 API), подробные descriptions на английском
- `src/index.ts` — запуск через StdioServerTransport (без лишних console.log в stdout)
- `src/tools/index-folder.ts` — заглушка
- `src/tools/ask-question.ts` — заглушка
- `src/tools/find-relevant.ts` — заглушка
- `src/tools/index-status.ts` — заглушка

**Установленные зависимости:**
```
@modelcontextprotocol/sdk@^1.29.0  zod@^4.4.3
tsx@^4.22.4  vitest@^4.1.9  @types/node@^26.0.0  typescript@^5.5.3
@modelcontextprotocol/inspector@^0.22.0
```

**Важные выводы (для следующего агента):**
- MCP SDK v2: использовать `server.registerTool(name, { description, inputSchema: z.object({...}) }, callback)`. Метод `server.tool()` — deprecated, инспектор показывает предупреждение.
- Транспорт stdio: stdout строго для JSON-RPC. Любой `console.log` в stdout ломает протокол. Для отладки — только `console.error` (пишет в stderr, видно в инспекторе).
- MCP Inspector v0.22.0: хранит настройки подключения в localStorage браузера. При проблемах — чистить localStorage / открывать в incognito. Запуск: `npm run dev` → открыть URL из вывода в браузере → Transport=STDIO, Command=tsx, Arguments=src/index.ts.
- Имя сервера `rag-knowledge-base` (не `corrective-rag-mcp`) — описывает что делает, а не как реализован.
- Descriptions инструментов — на английском (агенты Copilot/Claude лучше работают с английским).

**Проверено:** `npm run build` — чистая сборка. MCP Inspector: все 4 инструмента видны, `index_status` вызывается успешно.

**Запуск для разработки:** `npm run dev`

---

### ✅ Итерация 2: Индексер документов

**Цель:** `index_folder` и `index_status` работают полностью.

**Статус:** ЗАВЕРШЕНА

**Что сделано:**
- `src/indexer/loaders.ts` — рекурсивный обход папки, чтение файлов по расширению (.md/.txt/.py/.js/.ts/.json/.yaml)
- `src/indexer/chunker.ts` — `RecursiveCharacterTextSplitter` с `fromLanguage` для markdown/js/python; `.ts` → `'js'` (TypeScript нет в списке поддерживаемых, JS-разделители совместимы)
- `src/indexer/indexer.ts` — координация load→chunk→embed→store; статус в памяти; `indexedChunks[]` для BM25 в Итерации 3
- `src/retriever/vector.ts` — ChromaDB клиент + `OllamaEmbeddings`; батчинг по 50 чанков; `resetCollection()` при переиндексации
- Обновлён `src/tools/index-folder.ts`
- Обновлён `src/tools/index-status.ts`

**Установленные зависимости:**
```
@langchain/core @langchain/textsplitters @langchain/ollama chromadb
```

**Важные выводы (для следующего агента):**
- `@langchain/textsplitters` v1.0.1 не поддерживает `'ts'` как язык в `fromLanguage()`. Решение: `.ts` файлы чанкуются как `'js'` — разделители совместимы, для наших целей некритично.
- Для работы `index_folder` нужны запущенные сервисы: ChromaDB (`http://localhost:8000`) и Ollama (`http://localhost:11434`) с моделью `nomic-embed-text`.
- `indexedChunks` экспортируется из `indexer.ts` как in-memory массив — BM25Retriever в Итерации 3 будет работать с ним напрямую.
- Русскоязычные документы: сплиттер и эмбеддинги работают корректно. BM25 в Итерации 3 потребует внимания — без стемминга/лемматизации качество для русского будет ниже (токены "дракон"/"дракона" разные).
- `@langchain/community` (нужен для BM25) — намеренно не установлен, ставить в Итерации 3.

**Проверка:** `npm run build` — чистая сборка. Функциональная проверка требует запущенных ChromaDB и Ollama.

---

### ✅ Итерация 2.5: Biome (форматирование + линтинг)

**Цель:** настроить форматирование и линтинг, привести весь существующий код в соответствие.

**Статус:** ЗАВЕРШЕНА

**Что сделано:**
- Установлен `@biomejs/biome` v2.5.1
- `biome.json`: spaces/2, lineWidth 100, одинарные кавычки, semicolons, trailingCommas, organizeImports
- Скрипты в `package.json`: `check`, `lint`, `format`
- Весь код в `src/` приведён в соответствие: `biome check --write --unsafe src` — 0 замечаний
- `npm run build` — чистый

**Важно:** начиная с Итерации 3 весь новый код сразу писать в соответствии с этими правилами. Node.js built-ins импортировать с префиксом `node:` (`node:fs`, `node:path`).

---

### ✅ Итерация 2.7: Прогресс индексации + замер производительности

**Цель:** убедиться что всё работает вживую, замерить скорость эмбеддинга, принять решения по дальнейшей архитектуре (Docker vs нативный Ollama, выбор модели).

**Статус:** ЗАВЕРШЕНА

**Что сделано:**

- `src/progress.ts` — класс `ProgressTracker`, инстанс на каждый tool call, жизненный цикл совпадает с запросом
  - `measureBatch(fn, { totalBatches })` — HOF: оборачивает `fn`, измеряет время внутри, логирует батч + MCP-нотификация
  - `onDone(totalChunks)` — итоговая строка с avg tok/s
  - `onError(err)` — лог ошибки с числом завершённых батчей
  - Все внутренние типы (`_BatchProgress`, `_RawBatchMeta`) и приватные поля скрыты — наружу только 3 публичных метода
- `src/retriever/vector.ts` — `addChunks(chunks, tracker?)`:
  ```typescript
  const embedFn = emb.embedDocuments.bind(emb);
  const embed = tracker?.measureBatch(embedFn, { totalBatches }) ?? embedFn;
  // тело цикла не знает о трекере
  ```
- `src/indexer/indexer.ts` — принимает `tracker?: ProgressTracker`, передаёт в `addChunks`, вызывает `onDone`/`onError`
- `src/tools/index-folder.ts` — принимает и прокидывает `tracker`
- `src/server.ts` — `new ProgressTracker(ctx)` создаётся на каждый вызов `index_folder`
- `glob_pattern` убран из схемы инструмента (не использовался)

**Формат вывода:**
```
[indexer] batch 2/10 | 50 chunks | 1234ms | ~6500 tok/s   ← stderr + MCP notify (одно сообщение)
[indexer] done: 213 chunks, 4.1s total, avg ~6800 tok/s
[indexer] failed after 2/10 batches: connect ECONNREFUSED  ← при ошибке
```

**Архитектурные решения:**
- `ProgressTracker` — отдельный модуль `src/progress.ts`, не привязан к домену indexer
- Жизненный цикл: новый инстанс per tool call → данные не протекают между вызовами, `reset()` не нужен
- В Итерации 4 (`ask_question`) добавить `onRagStep()` в тот же класс

**Живое тестирование (ЗАВЕРШЕНО):**

`npm run test:index` — скрипт `scripts/test-indexer.ts`, проверяет доступность сервисов и запускает индексацию с `ProgressTracker`.

Результаты на MacBook M1 Pro, модель `nomic-embed-text` (137M, F16), 754 чанка / 24 файла:

| Окружение | Cold start (batch 1) | Стабильный батч | avg tok/s | Всего |
|---|---|---|---|---|
| Ollama в Docker | 43 199ms | 12–31с | ~384 tok/s | 340с (5.7 мин) |
| Ollama нативный | 3 307ms | 1–1.5с | ~6 297 tok/s | 20.7с |

**Разница: нативный в ~16 раз быстрее.**

**Почему Docker медленный на Mac:** Docker работает через Linux VM без доступа к Metal/Neural Engine — только CPU. На Linux/Windows с NVIDIA GPU через `--gpus all` Docker даёт скорость близкую к нативной.

**Решение:** на Mac обязателен нативный Ollama. На Linux/Windows с GPU — Docker работает нормально.

---

### 🔲 Итерация 3: Гибридный поиск (BM25 + Vector + RRF)

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

### ✅ Итерация 5: Тесты (unit, чистые модули)

**Цель:** Покрыть тестами чистые модули без внешних зависимостей.

**Статус:** ЗАВЕРШЕНА (unit-тесты) / интеграционные и e2e — после Итерации 4

**Что сделано:**

Структура: тесты располагаются в `__tests__/` рядом с модулем (конвенция Jest/Vitest сообщества).

- `src/indexer/__tests__/loaders.test.ts` — 11 тестов:
  - Валидация: несуществующая папка, файл вместо папки
  - Основные случаи: пустая папка, чтение поддерживаемых расширений, пропуск неподдерживаемых, метаданные, рекурсия
  - Edge cases: файлы без расширения (`README`), скрытые файлы (`.gitignore`), нечитаемые файлы

- `src/indexer/__tests__/chunker.test.ts` — 7 тестов:
  - Основные случаи: непустой контент, пустой контент, метаданные, последовательные индексы, непустые чанки
  - Edge cases: контент только из пробелов → пустой массив; очень длинное слово без пробелов → без краша

- `src/__tests__/progress.test.ts` — 10 тестов:
  - `measureBatch`: результат, передача аргументов, счётчик батчей, пробрасывание исключения, пустой массив без деления на ноль
  - `onDone`: счётчик чанков, avg 0 tok/s без батчей
  - `onError`: сообщение, не-Error значения, счётчик батчей, отсутствие счётчика без батчей

**Итого:** 28 тестов, 3 файла, `npx vitest run` — всё зелёное.

**Что осталось (после Итерации 4):**
- `src/rag/__tests__/nodes.test.ts` — узлы графа с mock LLM
- `tests/e2e/mcp-tools.test.ts` — e2e тесты MCP инструментов
- Интеграционные тесты `vector.ts` / `indexer.ts` (требуют ChromaDB + Ollama)

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
