export async function handleIndexStatus(): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  // TODO: implement in iteration 2
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        indexed_files: 0,
        indexed_chunks: 0,
        last_indexed_at: null,
        status: 'empty',
      }),
    }],
  };
}
