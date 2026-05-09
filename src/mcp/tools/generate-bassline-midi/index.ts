import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { generateBasslineMidiHandler } from './handler.js';
import { inputSchema, outputSchema } from './schemas.js';

export function registerGenerateBasslineMidiTool(server: McpServer): void {
  server.registerTool(
    'generate-bassline-midi',
    {
      title: 'Generate Bassline MIDI',
      description:
        'Renders a bassline (octave 2) under a chord progression to a Standard MIDI File (SMF1, 480 PPQ, 4/4).',
      inputSchema: inputSchema.shape,
      outputSchema: outputSchema.shape,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    (input): CallToolResult => {
      const result = generateBasslineMidiHandler(input);
      return {
        content: [
          {
            type: 'text',
            text: `Bassline MIDI: ${input.style} over ${input.chords.length} chord(s), ${input.tempo} BPM.`,
          },
        ],
        structuredContent: result,
      };
    },
  );
}
