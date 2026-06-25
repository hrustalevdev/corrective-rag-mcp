import { indexFolder } from '../indexer/indexer.js';
import type { ProgressTracker } from '../progress.js';

export async function handleIndexFolder(
  folderPath: string,
  tracker?: ProgressTracker,
): Promise<{ isError?: boolean; content: Array<{ type: 'text'; text: string }> }> {
  const result = await indexFolder(folderPath, tracker);

  if (result.status === 'ready') {
    return {
      content: [{ type: 'text', text: JSON.stringify({
        status: 'success',
        folder: result.folderPath,
        indexed_files: result.indexedFiles,
        indexed_chunks: result.indexedChunks,
        last_indexed_at: result.lastIndexedAt,
      }) }],
    };
  }

  return {
    isError: true,
    content: [{ type: 'text', text: JSON.stringify({
      status: 'error',
      folder: folderPath,
      error: result.error ?? 'Unknown error',
    }) }],
  };
}
