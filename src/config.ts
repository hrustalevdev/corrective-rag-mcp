import { z } from 'zod';

const envSchema = z.object({
  OLLAMA_BASE_URL: z.string().url(),
  OLLAMA_MODEL: z.string(),
  OLLAMA_EMBEDDING_MODEL: z.string(),
  CHROMA_URL: z.string().url(),
  CHROMA_COLLECTION: z.string(),
  MIN_RELEVANT_CHUNKS: z.coerce.number().int().positive(),
  MAX_RETRIEVE_RETRIES: z.coerce.number().int().nonnegative(),
});

const env = envSchema.parse(process.env);

export const config = {
  ollama: {
    baseUrl: env.OLLAMA_BASE_URL,
    model: env.OLLAMA_MODEL,
    embeddingModel: env.OLLAMA_EMBEDDING_MODEL,
  },
  chroma: {
    url: env.CHROMA_URL,
    collection: env.CHROMA_COLLECTION,
  },
  rag: {
    minRelevantChunks: env.MIN_RELEVANT_CHUNKS,
    maxRetrieveRetries: env.MAX_RETRIEVE_RETRIES,
  },
} as const;
