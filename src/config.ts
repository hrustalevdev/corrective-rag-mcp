export const config = {
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL ?? 'qwen2.5:3b',
    embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL ?? 'nomic-embed-text',
  },
  chroma: {
    url: process.env.CHROMA_URL ?? 'http://localhost:8000',
    collection: process.env.CHROMA_COLLECTION ?? 'rag_documents',
  },
  rag: {
    minRelevantChunks: parseInt(process.env.MIN_RELEVANT_CHUNKS ?? '2', 10),
    maxRetrieveRetries: parseInt(process.env.MAX_RETRIEVE_RETRIES ?? '2', 10),
  },
} as const;
