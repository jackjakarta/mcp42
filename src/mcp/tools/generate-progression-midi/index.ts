import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { generateProgressionMidiHandler } from './handler.js';
import { inputSchema, outputSchema } from './schemas.js';

export function registerGenerateProgressionMidiTool(server: McpServer): void {
  server.registerTool(
    'generate-progression-midi',
    {
      title: 'Generate Progression MIDI',
      description:
        'Renders a chord progression to a Standard MIDI File (SMF1, 480 PPQ, 4/4) with the chosen voicing.',
      inputSchema: inputSchema.shape,
      outputSchema: outputSchema.shape,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    (input): CallToolResult => {
      const result = generateProgressionMidiHandler(input);
      return {
        content: [
          {
            type: 'text',
            text: `Progression MIDI: ${input.chords.length} chord(s), ${input.voicing} voicing, ${input.tempo} BPM, ${(result.durationMs / 1000).toFixed(2)}s.`,
          },
        ],
        structuredContent: result,
      };
    },
  );
}
