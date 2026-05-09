import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { getModeHandler } from './handler.js';
import { inputSchema, outputSchema } from './schemas.js';

export function registerGetModeTool(server: McpServer): void {
  server.registerTool(
    'get-mode',
    {
      title: 'Get Mode',
      description: 'Fetch a single mode from the music knowledge graph by its unique slug.',
      inputSchema: inputSchema.shape,
      outputSchema: outputSchema.shape,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async (input): Promise<CallToolResult> => {
      const result = await getModeHandler(input);
      return {
        content: [
          {
            type: 'text',
            text: `${result.name} (${result.parentScale}) — intervals ${result.intervals.join(' ')}`,
          },
        ],
        structuredContent: result,
      };
    },
  );
}
