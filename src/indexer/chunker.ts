import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import type { LoadedDoc } from './loaders.js';

export interface Chunk {
  content: string;
  metadata: {
    source: string;
    extension: string;
    chunkIndex: number;
  };
}

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 100;

type SplitterLanguage = 'markdown' | 'js' | 'python';

export async function chunkDocument(doc: LoadedDoc): Promise<Chunk[]> {
  const lang = _getLanguage(doc.metadata.extension);

  const splitter = lang
    ? RecursiveCharacterTextSplitter.fromLanguage(lang, {
        chunkSize: CHUNK_SIZE,
        chunkOverlap: CHUNK_OVERLAP,
      })
    : new RecursiveCharacterTextSplitter({ chunkSize: CHUNK_SIZE, chunkOverlap: CHUNK_OVERLAP });

  const pieces = await splitter.splitText(doc.content);

  return pieces.map((content, i) => ({
    content,
    metadata: {
      source: doc.metadata.source,
      extension: doc.metadata.extension,
      chunkIndex: i,
    },
  }));
}

// HELPERS

function _getLanguage(ext: string): SplitterLanguage | null {
  switch (ext) {
    case '.md':
      return 'markdown';
    case '.ts':
    case '.js':
      return 'js';
    case '.py':
      return 'python';
    default:
      return null;
  }
}
