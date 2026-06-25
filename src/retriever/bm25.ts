import MiniSearch from 'minisearch';
import type { Chunk } from '../indexer/chunker.js';

export interface BM25Result {
  content: string;
  metadata: Record<string, string | number>;
  score: number;
}

interface _Doc {
  id: string;
  content: string;
  source: string;
  extension: string;
  chunkIndex: number;
}

export class BM25Index {
  private _ms: MiniSearch<_Doc>;

  constructor() {
    this._ms = new MiniSearch<_Doc>({
      fields: ['content'],
      storeFields: ['content', 'source', 'extension', 'chunkIndex'],
      tokenize: (text) => text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [],
      searchOptions: {
        bm25: { k: 1.5, b: 0.75, d: 0.5 },
      },
    });
  }

  update(chunks: Chunk[]): void {
    this._ms.removeAll();
    this._ms.addAll(
      chunks.map((c) => ({
        id: `${c.metadata.source}::${c.metadata.chunkIndex}`,
        content: c.content,
        source: c.metadata.source,
        extension: c.metadata.extension,
        chunkIndex: c.metadata.chunkIndex,
      })),
    );
  }

  search(query: string, topK: number): BM25Result[] {
    if (!query.trim()) return [];
    return this._ms
      .search(query)
      .slice(0, topK)
      .map((r) => ({
        content: r.content as string,
        metadata: {
          source: r.source as string,
          extension: r.extension as string,
          chunkIndex: r.chunkIndex as number,
        },
        score: r.score,
      }));
  }

  reset(): void {
    this._ms.removeAll();
  }
}

export const bm25 = new BM25Index();
