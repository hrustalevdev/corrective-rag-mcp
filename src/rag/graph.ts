import { END, START, StateGraph } from '@langchain/langgraph';
import { ChatOllama } from '@langchain/ollama';
import { config } from '../config.js';
import { createNodes } from './nodes.js';
import type { RagStateType } from './state.js';
import { RagState } from './state.js';

export function shouldContinue(state: RagStateType): 'generateAnswer' | 'broadenQuery' {
  const enough = state.relevantChunks.length >= config.rag.minRelevantChunks;
  const exhausted = state.retryCount >= config.rag.maxRetrieveRetries;
  return enough || exhausted ? 'generateAnswer' : 'broadenQuery';
}

export function createGraph(llm?: ChatOllama) {
  const model =
    llm ??
    new ChatOllama({
      baseUrl: config.ollama.baseUrl,
      model: config.ollama.model,
    });
  const nodes = createNodes(model);

  return new StateGraph(RagState)
    .addNode('rewriteQuery', nodes.rewriteQuery)
    .addNode('retrieve', nodes.retrieve)
    .addNode('gradeChunks', nodes.gradeChunks)
    .addNode('generateAnswer', nodes.generateAnswer)
    .addNode('broadenQuery', nodes.broadenQuery)
    .addEdge(START, 'rewriteQuery')
    .addEdge('rewriteQuery', 'retrieve')
    .addEdge('retrieve', 'gradeChunks')
    .addConditionalEdges('gradeChunks', shouldContinue, ['generateAnswer', 'broadenQuery'])
    .addEdge('broadenQuery', 'retrieve')
    .addEdge('generateAnswer', END)
    .compile();
}

export const compiledGraph = createGraph();
