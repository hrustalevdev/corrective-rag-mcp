export async function handleAskQuestion(
  question: string
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  // TODO: implement in iteration 4
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        status: 'not_implemented',
        question,
        answer: null,
        sources: [],
        message: 'Corrective RAG pipeline not yet implemented',
      }),
    }],
  };
}
