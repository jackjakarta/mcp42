import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { getNoteInfoHandler } from './handler.js';
import { inputSchema, outputSchema } from './schemas.js';

export function registerGetNoteInfoTool(server: McpServer): void {
  server.registerTool(
    'get-note-info',
    {
      title: 'Get Note Info',
      description:
        'Returns name, pitch class, octave, MIDI number, frequency, and accidentals for a note.',
      inputSchema: inputSchema.shape,
      outputSchema: outputSchema.shape,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    ({ note }): CallToolResult => {
      const info = getNoteInfoHandler(note);
      return {
        content: [
          {
            type: 'text',
            text: `${info.name}: pc ${info.pc}, octave ${info.octave}, midi ${info.midi}, freq ${info.freq.toFixed(2)} Hz`,
          },
        ],
        structuredContent: info,
      };
    },
  );
}
