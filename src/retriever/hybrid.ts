import { type BM25Result, bm25 } from './bm25.js';
import { queryChunks, type VectorResult } from './vector.js';

export interface HybridResult {
  content: string;
  metadata: Record<string, string | number>;
  score: number;
  rank: number;
}

export async function hybridSearch(query: string, topK: number): Promise<HybridResult[]> {
  const fetchK = topK * 2;
  const [bm25Results, vectorResults] = await Promise.all([
    Promise.resolve(bm25.search(query, fetchK)),
    queryChunks(query, fetchK),
  ]);

  return _rrfFusion(bm25Results, vectorResults, topK);
}

// HELPERS

const RRF_K = 60;

function _rrfFusion(
  bm25Results: BM25Result[],
  vectorResults: VectorResult[],
  topK: number,
): HybridResult[] {
  const scores = new Map<string, { score: number; metadata: Record<string, string | number> }>();

  const _addList = (
    items: Array<{ content: string; metadata: Record<string, string | number> }>,
  ) => {
    items.forEach((item, rank) => {
      const rrfScore = 1 / (RRF_K + rank + 1);
      const existing = scores.get(item.content);

      if (existing) {
        existing.score += rrfScore;
      } else {
        scores.set(item.content, { score: rrfScore, metadata: item.metadata });
      }
    });
  };

  _addList(bm25Results);
  _addList(vectorResults.map((r) => ({ content: r.content, metadata: r.metadata })));

  return Array.from(scores.entries())
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, topK)
    .map(([content, { score, metadata }], i) => ({ content, metadata, score, rank: i + 1 }));
}
