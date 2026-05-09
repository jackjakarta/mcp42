import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { listVoicingsHandler } from './handler.js';
import { inputSchema, outputSchema } from './schemas.js';

export function registerListVoicingsTool(server: McpServer): void {
  server.registerTool(
    'list-voicings',
    {
      title: 'List Voicings',
      description:
        'List voicings from the music knowledge graph, optionally filtered by chord quality or instrument.',
      inputSchema: inputSchema.shape,
      outputSchema: outputSchema.shape,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async (input): Promise<CallToolResult> => {
      const result = await listVoicingsHandler(input);
      return {
        content: [
          {
            type: 'text',
            text: `${result.results.length} voicing(s) returned.`,
          },
        ],
        structuredContent: result,
      };
    },
  );
}
