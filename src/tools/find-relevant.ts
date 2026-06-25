export async function handleFindRelevantDocs(
  query: string,
  topK: number,
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  // TODO: implement in iteration 3
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          status: 'not_implemented',
          query,
          top_k: topK,
          chunks: [],
          message: 'Hybrid search not yet implemented',
        }),
      },
    ],
  };
}
