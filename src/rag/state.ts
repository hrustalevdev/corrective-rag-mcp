import { Annotation } from '@langchain/langgraph';
import type { HybridResult } from '../retriever/hybrid.js';

export interface RelevantChunk {
  content: string;
  source: string;
}

export const RagState = Annotation.Root({
  query: Annotation<string>({
    reducer: (_current, update) => update,
  }),
  rewrittenQuery: Annotation<string>({
    reducer: (_current, update) => update,
    default: () => '',
  }),
  chunks: Annotation<HybridResult[]>({
    reducer: (_current, update) => update,
    default: () => [],
  }),
  relevantChunks: Annotation<RelevantChunk[]>({
    reducer: (_current, update) => update,
    default: () => [],
  }),
  answer: Annotation<string>({
    reducer: (_current, update) => update,
    default: () => '',
  }),
  retryCount: Annotation<number>({
    reducer: (_current, update) => update,
    default: () => 0,
  }),
  sources: Annotation<string[]>({
    reducer: (_current, update) => update,
    default: () => [],
  }),
});

export type RagStateType = typeof RagState.State;
