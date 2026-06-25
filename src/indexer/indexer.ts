import type { ProgressTracker } from '../progress/tracker.js';
import { bm25 } from '../retriever/bm25.js';
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
    bm25.update(allChunks);
    tracker?.onDone(allChunks.length);

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
    bm25.reset();
  }

  return { ...state };
}

export function getStatus(): IndexerState {
  return { ...state };
}
