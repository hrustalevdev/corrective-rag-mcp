import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ProgressTracker } from './progress/tracker.js';
import { handleAskQuestion } from './tools/ask-question.js';
import { handleFindRelevantDocs } from './tools/find-relevant.js';
import { handleIndexFolder } from './tools/index-folder.js';
import { handleIndexStatus } from './tools/index-status.js';

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'rag-knowledge-base',
    version: '1.0.0',
  });

  server.registerTool(
    'index_folder',
    {
      description: `Index all documents in a local folder and store them in the knowledge base for future queries.
Supports .md, .txt, .py, .js, .ts, .json, .yaml files.
Use this tool whenever the user wants to add documents, update the knowledge base, or index a project directory.
After indexing, documents become searchable via ask_question and find_relevant_docs.`,
      inputSchema: z.object({
        folder_path: z
          .string()
          .nonempty()
          .describe('Absolute or relative path to the folder to index'),
      }),
    },
    async ({ folder_path }, ctx) => {
      const tracker = new ProgressTracker(ctx);
      return handleIndexFolder(folder_path, tracker);
    },
  );

  server.registerTool(
    'index_status',
    {
      description: `Return statistics about the current knowledge base index: number of indexed files, chunks, and timestamp of last indexing.
Use this tool to check if documents have been indexed before answering questions, or to verify indexing completed successfully.`,
      inputSchema: z.object({}),
    },
    async () => handleIndexStatus(),
  );

  server.registerTool(
    'find_relevant_docs',
    {
      description: `Search the knowledge base using hybrid search (BM25 keyword search + semantic vector search combined via Reciprocal Rank Fusion).
Returns ranked document chunks with scores and source file paths — WITHOUT generating an LLM answer.
Use this tool when the user wants to find relevant passages, explore the knowledge base, or when a raw search result is needed rather than a generated answer.`,
      inputSchema: z.object({
        query: z.string().describe('Search query to find relevant documents'),
        top_k: z
          .number()
          .int()
          .min(1)
          .max(20)
          .default(5)
          .describe('Number of top chunks to return'),
      }),
    },
    async ({ query, top_k }) => handleFindRelevantDocs(query, top_k),
  );

  server.registerTool(
    'ask_question',
    {
      description: `Answer a question using the indexed knowledge base via the Corrective RAG pipeline.
The pipeline: rewrites the query → retrieves documents (hybrid BM25 + vector search) → grades chunk relevance → generates a grounded answer with source citations.
If initial retrieval yields insufficient relevant chunks, the query is automatically broadened and retrieval is retried (up to 2 times).
Use this tool whenever the user asks a question that should be answered from the indexed documents.`,
      inputSchema: z.object({
        question: z.string().describe('The question to answer using the knowledge base'),
      }),
    },
    async ({ question }) => handleAskQuestion(question),
  );

  return server;
}
