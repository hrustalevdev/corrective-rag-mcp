import type { ProgressTracker } from '../progress.js';
import { addChunks, resetCollection } from '../retriever/vector.js';
import { type Chunk, chunkDocument } from './chunker.js';
import { loadFilesFromFolder } from './loaders.js';

export type IndexStatus = 'empty' | 'indexing' | 'ready' | 'error';

interface IndexerState {
  status: IndexStatus;
  indexedFiles: number;
  indexedChunks: number;
  lastIndexedAt: string | null;
  folderPath: string | null;
  error?: string;
}

const state: IndexerState = {
  status: 'empty',
  indexedFiles: 0,
  indexedChunks: 0,
  lastIndexedAt: null,
  folderPath: null,
};

// stored in memory for BM25 retrieval (Iteration 3)
export let indexedChunks: Chunk[] = [];

export async function indexFolder(
  folderPath: string,
  tracker?: ProgressTracker,
): Promise<IndexerState> {
  state.status = 'indexing';
  state.error = undefined;

  try {
    const docs = loadFilesFromFolder(folderPath);

    const allChunks: Chunk[] = [];
    for (const doc of docs) {
      const chunks = await chunkDocument(doc);
      allChunks.push(...chunks);
    }

    await resetCollection();
    await addChunks(allChunks, tracker);
    tracker?.onDone(allChunks.length);

    indexedChunks = allChunks;
    state.indexedFiles = docs.length;
    state.indexedChunks = allChunks.length;
    state.lastIndexedAt = new Date().toISOString();
    state.folderPath = folderPath;
    state.status = 'ready';
  } catch (err) {
    tracker?.onError(err);
    state.status = 'error';
    state.error = err instanceof Error ? err.message : String(err);
    state.indexedFiles = 0;
    state.indexedChunks = 0;
    indexedChunks = [];
  }

  return { ...state };
}

export function getStatus(): IndexerState {
  return { ...state };
}
