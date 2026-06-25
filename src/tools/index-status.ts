import { getStatus } from '../indexer/indexer.js';

export async function handleIndexStatus(): Promise<{
  content: Array<{ type: 'text'; text: string }>;
}> {
  const s = getStatus();

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          status: s.status,
          indexed_files: s.indexedFiles,
          indexed_chunks: s.indexedChunks,
          last_indexed_at: s.lastIndexedAt,
          folder: s.folderPath,
          ...(s.error ? { error: s.error } : {}),
        }),
      },
    ],
  };
}
