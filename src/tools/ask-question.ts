import { compiledGraph } from '../rag/graph.js';

export async function handleAskQuestion(
  question: string,
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const result = await compiledGraph.invoke({ query: question });
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          answer: result.answer,
          sources: result.sources,
          chunks_used: result.relevantChunks.length,
          retries: result.retryCount,
        }),
      },
    ],
  };
}
