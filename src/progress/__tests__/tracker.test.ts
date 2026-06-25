import { describe, expect, it, vi } from 'vitest';
import { ProgressTracker } from '../tracker.js';

describe('ProgressTracker', () => {
  describe('measureBatch', () => {
    it('returns the wrapped function result', async () => {
      const tracker = new ProgressTracker();
      const vectors = [[1, 2, 3]];
      const embed = tracker.measureBatch(async () => vectors, { totalBatches: 1 });
      expect(await embed(['hello'])).toBe(vectors);
    });

    it('calls the wrapped function with the same contents', async () => {
      const tracker = new ProgressTracker();
      const fn = vi.fn().mockResolvedValue([]);
      const embed = tracker.measureBatch(fn, { totalBatches: 1 });
      await embed(['a', 'b', 'c']);
      expect(fn).toHaveBeenCalledWith(['a', 'b', 'c']);
    });

    it('propagates error from wrapped function', async () => {
      const tracker = new ProgressTracker();
      const fn = vi.fn().mockRejectedValue(new Error('embed failed'));
      const embed = tracker.measureBatch(fn, { totalBatches: 1 });
      await expect(embed(['a'])).rejects.toThrow('embed failed');
    });

    it('handles empty contents array without division by zero', async () => {
      const tracker = new ProgressTracker();
      const fn = vi.fn().mockResolvedValue([]);
      const embed = tracker.measureBatch(fn, { totalBatches: 1 });
      await expect(embed([])).resolves.toEqual([]);
    });

    it('tracks batch count across multiple calls', async () => {
      const tracker = new ProgressTracker();
      const fn = vi.fn().mockResolvedValue([]);
      const embed = tracker.measureBatch(fn, { totalBatches: 3 });
      await embed(['a']);
      await embed(['b']);
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      tracker.onError(new Error('stop'));
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('2/3'));
      spy.mockRestore();
    });
  });

  describe('onDone', () => {
    it('logs avg 0 tok/s when called without any batches', () => {
      const tracker = new ProgressTracker();
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      tracker.onDone(0);
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('~0 tok/s'));
      spy.mockRestore();
    });

    it('logs total chunk count', () => {
      const tracker = new ProgressTracker();
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      tracker.onDone(754);
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('754 chunks'));
      spy.mockRestore();
    });
  });

  describe('onError', () => {
    it('logs error message', () => {
      const tracker = new ProgressTracker();
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      tracker.onError(new Error('connection refused'));
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('connection refused'));
      spy.mockRestore();
    });

    it('handles non-Error values', () => {
      const tracker = new ProgressTracker();
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      tracker.onError('something went wrong');
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('something went wrong'));
      spy.mockRestore();
    });

    it('omits batch info when no batches were processed', () => {
      const tracker = new ProgressTracker();
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      tracker.onError(new Error('fail'));
      expect(spy).toHaveBeenCalledWith(expect.not.stringContaining('/'));
      spy.mockRestore();
    });
  });
});
