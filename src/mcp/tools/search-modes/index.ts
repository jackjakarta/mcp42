import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { searchModesHandler } from './handler.js';
import { inputSchema, outputSchema } from './schemas.js';

export function registerSearchModesTool(server: McpServer): void {
  server.registerTool(
    'search-modes',
    {
      title: 'Search Modes',
      description: 'Search the music knowledge graph for modes by mood, genre, or parent scale.',
      inputSchema: inputSchema.shape,
      outputSchema: outputSchema.shape,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async (input): Promise<CallToolResult> => {
      const result = await searchModesHandler(input);
      return {
        content: [
          {
            type: 'text',
            text: `${result.results.length} mode(s) matched.`,
          },
        ],
        structuredContent: result,
      };
    },
  );
}
