import { hybridSearch } from '../retriever/hybrid.js';

export async function handleFindRelevantDocs(
  query: string,
  topK: number,
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const chunks = await hybridSearch(query, topK);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          chunks: chunks.map((c) => ({
            content: c.content,
            source: c.metadata.source,
            score: Math.round(c.score * 1000) / 1000,
            rank: c.rank,
          })),
          total: chunks.length,
        }),
      },
    ],
  };
}
