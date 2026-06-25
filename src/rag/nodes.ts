import type { ChatOllama } from '@langchain/ollama';
import type { HybridResult } from '../retriever/hybrid.js';
import { hybridSearch } from '../retriever/hybrid.js';
import type { RagStateType, RelevantChunk } from './state.js';

const RETRIEVE_TOP_K = 5;

export function createNodes(llm: ChatOllama) {
  async function rewriteQuery(state: RagStateType): Promise<Partial<RagStateType>> {
    const prompt = `Rewrite the following user query to improve retrieval from a knowledge base.
Return ONLY the rewritten query, nothing else.
Original query: ${state.query}`;
    const response = await llm.invoke(prompt);
    return { rewrittenQuery: (response.content as string).trim() };
  }

  async function retrieve(state: RagStateType): Promise<Partial<RagStateType>> {
    const query = state.rewrittenQuery || state.query;
    const chunks = await hybridSearch(query, RETRIEVE_TOP_K);
    return { chunks };
  }

  async function gradeChunks(state: RagStateType): Promise<Partial<RagStateType>> {
    const query = state.rewrittenQuery || state.query;
    const grades = await Promise.all(
      state.chunks.map(async (chunk: HybridResult) => {
        const prompt = `Is the following document chunk relevant to answering the question?
Question: ${query}
Chunk: ${chunk.content}
Answer only "yes" or "no".`;
        const response = await llm.invoke(prompt);
        const answer = (response.content as string).trim().toLowerCase();
        return { chunk, relevant: answer.startsWith('yes') };
      }),
    );
    const relevantChunks: RelevantChunk[] = grades
      .filter((g) => g.relevant)
      .map((g) => ({
        content: g.chunk.content,
        source: (g.chunk.metadata.source as string) ?? '',
      }));
    return { relevantChunks };
  }

  async function generateAnswer(state: RagStateType): Promise<Partial<RagStateType>> {
    const query = state.rewrittenQuery || state.query;
    const chunksToUse: Array<{ content: string; source: string }> =
      state.relevantChunks.length > 0
        ? state.relevantChunks
        : state.chunks.map((c: HybridResult) => ({
            content: c.content,
            source: (c.metadata.source as string) ?? '',
          }));
    const sources = [...new Set(chunksToUse.map((c) => c.source))];
    const context = chunksToUse.map((c) => `Source: ${c.source}\n${c.content}`).join('\n\n---\n\n');
    const prompt = `Answer the following question using ONLY the provided context chunks.
If the context does not contain sufficient information, say "I don't have enough information in the knowledge base to answer this question."

Question: ${query}

Context:
${context}`;
    const response = await llm.invoke(prompt);
    return { answer: (response.content as string).trim(), sources };
  }

  async function broadenQuery(state: RagStateType): Promise<Partial<RagStateType>> {
    const currentQuery = state.rewrittenQuery || state.query;
    const prompt = `The following search query returned insufficient relevant results from a knowledge base.
Create a broader version using synonyms, related terms, or more general language.
Return ONLY the new query, nothing else.
Original query: ${currentQuery}`;
    const response = await llm.invoke(prompt);
    return {
      rewrittenQuery: (response.content as string).trim(),
      retryCount: state.retryCount + 1,
    };
  }

  return { rewriteQuery, retrieve, gradeChunks, generateAnswer, broadenQuery };
}
