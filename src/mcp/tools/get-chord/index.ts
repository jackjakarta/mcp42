import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { getChordHandler } from './handler.js';
import { inputSchema, outputSchema } from './schemas.js';

export function registerGetChordTool(server: McpServer): void {
  server.registerTool(
    'get-chord',
    {
      title: 'Get Chord',
      description:
        'Parses a chord symbol and returns root, quality, notes, intervals, extensions, and bass.',
      inputSchema: inputSchema.shape,
      outputSchema: outputSchema.shape,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    ({ symbol }): CallToolResult => {
      const info = getChordHandler(symbol);
      const bassLine = info.bass !== undefined ? ` / ${info.bass}` : '';
      return {
        content: [
          {
            type: 'text',
            text: `${symbol}${bassLine}: ${info.quality}, notes ${info.notes.join(' ')}`,
          },
        ],
        structuredContent: info,
      };
    },
  );
}
