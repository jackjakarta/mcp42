import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { getDiatonicChordsHandler } from './handler.js';
import { inputSchema, outputSchema } from './schemas.js';

export function registerGetDiatonicChordsTool(server: McpServer): void {
  server.registerTool(
    'get-diatonic-chords',
    {
      title: 'Get Diatonic Chords',
      description:
        'Returns the seven diatonic triads of a key with degree, Roman numeral, chord symbol, and quality bucket.',
      inputSchema: inputSchema.shape,
      outputSchema: outputSchema.shape,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    ({ key }): CallToolResult => {
      const result = getDiatonicChordsHandler(key);
      return {
        content: [
          {
            type: 'text',
            text: `${key}: ${result.chords.map((c) => c.symbol).join(' ')}`,
          },
        ],
        structuredContent: result,
      };
    },
  );
}
