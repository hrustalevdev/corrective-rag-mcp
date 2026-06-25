import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

export const SUPPORTED_EXTENSIONS = new Set([
  '.md',
  '.txt',
  '.py',
  '.js',
  '.ts',
  '.json',
  '.yaml',
  '.yml',
]);

export interface LoadedDoc {
  content: string;
  metadata: {
    source: string;
    extension: string;
  };
}

export function loadFilesFromFolder(folderPath: string): LoadedDoc[] {
  const absPath = resolve(folderPath);

  if (!existsSync(absPath)) throw new Error(`Folder not found: ${absPath}`);
  if (!statSync(absPath).isDirectory()) throw new Error(`Not a directory: ${absPath}`);

  const filePaths = _collectFilePaths(absPath);
  const docs: LoadedDoc[] = [];

  for (const filePath of filePaths) {
    const ext = extname(filePath);
    if (!SUPPORTED_EXTENSIONS.has(ext)) continue;

    try {
      const content = readFileSync(filePath, 'utf-8');
      docs.push({
        content,
        metadata: { source: filePath, extension: ext },
      });
    } catch {
      // skip unreadable files
    }
  }

  return docs;
}

// HELPERS

function _collectFilePaths(dir: string): string[] {
  const result: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      result.push(..._collectFilePaths(fullPath));
    } else if (entry.isFile()) {
      result.push(fullPath);
    }
  }

  return result;
}
