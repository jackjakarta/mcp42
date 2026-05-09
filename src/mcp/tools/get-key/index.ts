import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { getKeyHandler } from './handler.js';
import { inputSchema, outputSchema } from './schemas.js';

export function registerGetKeyTool(server: McpServer): void {
  server.registerTool(
    'get-key',
    {
      title: 'Get Key',
      description:
        'Returns key signature, scale, diatonic chords with Roman numerals, primary triads, and secondary dominants.',
      inputSchema: inputSchema.shape,
      outputSchema: outputSchema.shape,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    ({ tonic, mode }): CallToolResult => {
      const info = getKeyHandler(tonic, mode);
      const sigDisplay = info.signature === '' ? 'no accidentals' : info.signature;
      return {
        content: [
          {
            type: 'text',
            text: `${tonic} ${mode} (${sigDisplay}): ${info.diatonicChords.map((c) => c.symbol).join(' ')}`,
          },
        ],
        structuredContent: info,
      };
    },
  );
}
