import { OllamaEmbeddings } from '@langchain/ollama';
import { ChromaClient, type Collection } from 'chromadb';
import { config } from '../config.js';
import type { Chunk } from '../indexer/chunker.js';

const BATCH_SIZE = 50;

let chromaClient: ChromaClient | null = null;
let activeCollection: Collection | null = null;
let embedder: OllamaEmbeddings | null = null;

export async function resetCollection(): Promise<void> {
  const client = _getClient();

  try {
    await client.deleteCollection({ name: config.chroma.collection });
  } catch {
    // collection may not exist yet
  }

  activeCollection = await client.createCollection({ name: config.chroma.collection });
}

export async function addChunks(chunks: Chunk[]): Promise<void> {
  const collection = await _getCollection();
  const emb = _getEmbedder();

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const contents = batch.map((c) => c.content);
    const vectors = await emb.embedDocuments(contents);
    const ids = batch.map((c) => `${c.metadata.source}::${c.metadata.chunkIndex}`);

    await collection.add({
      ids,
      embeddings: vectors,
      documents: contents,
      metadatas: batch.map((c) => c.metadata as Record<string, string | number>),
    });
  }
}

export interface VectorResult {
  content: string;
  metadata: Record<string, string | number>;
  distance: number;
}

export async function queryChunks(query: string, topK: number): Promise<VectorResult[]> {
  const collection = await _getCollection();
  const queryVector = await _getEmbedder().embedQuery(query);

  const results = await collection.query({
    queryEmbeddings: [queryVector],
    nResults: topK,
  });

  const docs = results.documents[0] ?? [];
  const metadatas = results.metadatas[0] ?? [];
  const distances = results.distances?.[0] ?? [];

  return docs.map((doc, i) => ({
    content: doc ?? '',
    metadata: (metadatas[i] ?? {}) as Record<string, string | number>,
    distance: distances[i] ?? 0,
  }));
}

// HELPERS

function _getClient(): ChromaClient {
  if (!chromaClient) {
    chromaClient = new ChromaClient({ path: config.chroma.url });
  }

  return chromaClient;
}

function _getEmbedder(): OllamaEmbeddings {
  if (!embedder) {
    embedder = new OllamaEmbeddings({
      model: config.ollama.embeddingModel,
      baseUrl: config.ollama.baseUrl,
    });
  }

  return embedder;
}

async function _getCollection(): Promise<Collection> {
  if (!activeCollection) {
    activeCollection = await _getClient().getOrCreateCollection({ name: config.chroma.collection });
  }

  return activeCollection;
}
