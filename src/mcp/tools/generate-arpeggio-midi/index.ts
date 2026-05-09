import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { generateArpeggioMidiHandler } from './handler.js';
import { inputSchema, outputSchema } from './schemas.js';

export function registerGenerateArpeggioMidiTool(server: McpServer): void {
  server.registerTool(
    'generate-arpeggio-midi',
    {
      title: 'Generate Arpeggio MIDI',
      description:
        'Renders a chord as a sixteenth-note arpeggio MIDI file (SMF1, 480 PPQ, 4/4) using the chosen pattern.',
      inputSchema: inputSchema.shape,
      outputSchema: outputSchema.shape,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    (input): CallToolResult => {
      const result = generateArpeggioMidiHandler(input);
      return {
        content: [
          {
            type: 'text',
            text: `Arpeggio MIDI: ${input.chord} (${input.pattern}), ${input.bars} bar(s), ${input.tempo} BPM.`,
          },
        ],
        structuredContent: result,
      };
    },
  );
}
