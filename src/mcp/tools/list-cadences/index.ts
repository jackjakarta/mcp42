import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { listCadencesHandler } from './handler.js';
import { inputSchema, outputSchema } from './schemas.js';

export function registerListCadencesTool(server: McpServer): void {
  server.registerTool(
    'list-cadences',
    {
      title: 'List Cadences',
      description: 'List all cadences from the music knowledge graph.',
      inputSchema: inputSchema.shape,
      outputSchema: outputSchema.shape,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async (): Promise<CallToolResult> => {
      const result = await listCadencesHandler();
      return {
        content: [
          {
            type: 'text',
            text: `${result.results.length} cadence(s) returned.`,
          },
        ],
        structuredContent: result,
      };
    },
  );
}
