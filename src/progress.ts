import type { ProgressNotification } from '@modelcontextprotocol/sdk/types.js';

interface _BatchProgress {
  batch: number;
  totalBatches: number;
  chunksInBatch: number;
  elapsedMs: number;
  tokensPerSec: number;
}

interface _McpToolContext {
  _meta?: { progressToken?: string | number };
  sendNotification(n: ProgressNotification): Promise<void>;
}

export class ProgressTracker {
  private _totalMs = 0;
  private _totalWeightedTps = 0;
  private _currentBatch = 0;
  private _totalBatches = 0;
  private _notify?: (progress: number, total: number, message?: string) => void;

  constructor(mcpCtx?: _McpToolContext) {
    const progressToken = mcpCtx?._meta?.progressToken;

    if (mcpCtx !== undefined && progressToken !== undefined) {
      this._notify = (progress, total, message) => {
        mcpCtx
          .sendNotification({
            method: 'notifications/progress',
            params: {
              progressToken,
              progress,
              total,
              ...(message !== undefined ? { message } : {}),
            },
          })
          .catch(() => {});
      };
    }
  }

  measureBatch<T>(
    fn: (contents: string[]) => Promise<T>,
    { totalBatches }: { totalBatches: number },
  ): (contents: string[]) => Promise<T> {
    this._totalBatches = totalBatches;

    return async (contents) => {
      const batchNum = this._currentBatch + 1;
      const chars = contents.reduce((s, c) => s + c.length, 0);

      const t0 = performance.now();
      const result = await fn(contents);
      const elapsedMs = Math.round(performance.now() - t0);
      const tokensPerSec = elapsedMs > 0 ? Math.round(chars / 4 / (elapsedMs / 1000)) : 0;

      this._currentBatch += 1;

      this._onBatch({
        batch: batchNum,
        totalBatches: this._totalBatches,
        chunksInBatch: contents.length,
        elapsedMs,
        tokensPerSec,
      });

      return result;
    };
  }

  onDone(totalChunks: number): void {
    const avg = this._totalMs > 0 ? Math.round(this._totalWeightedTps / this._totalMs) : 0;
    console.error(
      `[indexer] done: ${totalChunks} chunks, ${(this._totalMs / 1000).toFixed(1)}s total, avg ~${avg} tok/s`,
    );
  }

  onError(err: unknown): void {
    const message = err instanceof Error ? err.message : String(err);
    const batchInfo =
      this._totalBatches > 0 ? ` after ${this._currentBatch}/${this._totalBatches} batches` : '';
    console.error(`[indexer] failed${batchInfo}: ${message}`);
  }

  private _onBatch(p: _BatchProgress): void {
    this._totalMs += p.elapsedMs;
    this._totalWeightedTps += p.tokensPerSec * p.elapsedMs;

    const msg = `batch ${p.batch}/${p.totalBatches} | ${p.chunksInBatch} chunks | ${p.elapsedMs}ms | ~${p.tokensPerSec} tok/s`;
    console.error(`[indexer] ${msg}`);
    this._notify?.(p.batch, p.totalBatches, msg);
  }
}
