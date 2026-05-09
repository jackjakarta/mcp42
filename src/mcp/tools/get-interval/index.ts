import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { getIntervalHandler } from './handler.js';
import { inputSchema, outputSchema } from './schemas.js';

export function registerGetIntervalTool(server: McpServer): void {
  server.registerTool(
    'get-interval',
    {
      title: 'Get Interval',
      description: 'Returns the interval between two notes (name, semitones, quality, number).',
      inputSchema: inputSchema.shape,
      outputSchema: outputSchema.shape,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    ({ from, to }): CallToolResult => {
      const info = getIntervalHandler(from, to);
      return {
        content: [
          {
            type: 'text',
            text: `${from} → ${to}: ${info.name} (${info.semitones} semitones)`,
          },
        ],
        structuredContent: info,
      };
    },
  );
}
