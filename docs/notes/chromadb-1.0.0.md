# ChromaDB 1.0.0 — два breaking changes

При обновлении Docker-образа ChromaDB с 0.5.x до 1.0.0 сломалось подключение с двумя разными ошибками.

## 1. `fetch failed` — параметр `path` устарел

`ChromaClient({ path: url })` — deprecated в `chromadb@3.x`. Новый API:

```typescript
// было
new ChromaClient({ path: 'http://localhost:8000' })

// стало
const { hostname, port, protocol } = new URL(url);
new ChromaClient({
  host: hostname,
  port: Number(port || (protocol === 'https:' ? 443 : 80)),
  ssl: protocol === 'https:',
})
```

## 2. `DefaultEmbeddingFunction` — вынесена в отдельный пакет

В `chromadb@3.x` дефолтная функция эмбеддингов вынесена в `@chroma-core/default-embed`. При создании коллекции без явной `embeddingFunction` клиент пытается её инстанцировать и падает. Так как мы предоставляем эмбеддинги сами (через Ollama), передаём `embeddingFunction: null`:

```typescript
client.createCollection({ name: '...', embeddingFunction: null })
client.getOrCreateCollection({ name: '...', embeddingFunction: null })
```

**Файл:** `src/retriever/vector.ts`
