import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { searchProgressionsHandler } from './handler.js';
import { inputSchema, outputSchema } from './schemas.js';

export function registerSearchProgressionsTool(server: McpServer): void {
  server.registerTool(
    'search-progressions',
    {
      title: 'Search Progressions',
      description:
        'Search the music knowledge graph for progressions by genre, mood, era, or Roman numeral content.',
      inputSchema: inputSchema.shape,
      outputSchema: outputSchema.shape,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async (input): Promise<CallToolResult> => {
      const result = await searchProgressionsHandler(input);
      return {
        content: [
          {
            type: 'text',
            text: `${result.results.length} progression(s) matched.`,
          },
        ],
        structuredContent: result,
      };
    },
  );
}
