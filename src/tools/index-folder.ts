import { indexFolder } from '../indexer/indexer.js';

export async function handleIndexFolder(
  folderPath: string,
  _globPattern?: string,
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const result = await indexFolder(folderPath);

  const text =
    result.status === 'ready'
      ? JSON.stringify({
          status: 'success',
          folder: result.folderPath,
          indexed_files: result.indexedFiles,
          indexed_chunks: result.indexedChunks,
          last_indexed_at: result.lastIndexedAt,
        })
      : JSON.stringify({
          status: 'error',
          folder: folderPath,
          error: result.error ?? 'Unknown error',
        });

  return { content: [{ type: 'text', text }] };
}
