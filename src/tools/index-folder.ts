export async function handleIndexFolder(
  folderPath: string,
  globPattern?: string
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  // TODO: implement in iteration 2
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        status: 'not_implemented',
        folder: folderPath,
        glob_pattern: globPattern ?? '**/*',
        message: 'Indexing not yet implemented',
      }),
    }],
  };
}
