import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { getProgressionHandler } from './handler.js';
import { inputSchema, outputSchema } from './schemas.js';

export function registerGetProgressionTool(server: McpServer): void {
  server.registerTool(
    'get-progression',
    {
      title: 'Get Progression',
      description: 'Fetch a single progression from the music knowledge graph by its unique slug.',
      inputSchema: inputSchema.shape,
      outputSchema: outputSchema.shape,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async (input): Promise<CallToolResult> => {
      const result = await getProgressionHandler(input);
      return {
        content: [
          {
            type: 'text',
            text: `${result.name} — ${result.romanNumerals.join(' ')}`,
          },
        ],
        structuredContent: result,
      };
    },
  );
}
