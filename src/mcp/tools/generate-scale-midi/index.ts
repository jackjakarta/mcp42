import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { generateScaleMidiHandler } from './handler.js';
import { inputSchema, outputSchema } from './schemas.js';

export function registerGenerateScaleMidiTool(server: McpServer): void {
  server.registerTool(
    'generate-scale-midi',
    {
      title: 'Generate Scale MIDI',
      description:
        'Renders a scale (quarter notes, 4/4) to a Standard MIDI File (SMF1, 480 PPQ) over the requested octaves and direction.',
      inputSchema: inputSchema.shape,
      outputSchema: outputSchema.shape,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    (input): CallToolResult => {
      const result = generateScaleMidiHandler(input);
      return {
        content: [
          {
            type: 'text',
            text: `Scale MIDI: ${input.tonic} ${input.type}, ${input.octaves} octave(s) ${input.direction}, ${input.tempo} BPM.`,
          },
        ],
        structuredContent: result,
      };
    },
  );
}
