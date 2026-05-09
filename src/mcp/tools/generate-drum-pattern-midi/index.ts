import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { generateDrumPatternMidiHandler } from './handler.js';
import { inputSchema, outputSchema } from './schemas.js';

export function registerGenerateDrumPatternMidiTool(server: McpServer): void {
  server.registerTool(
    'generate-drum-pattern-midi',
    {
      title: 'Generate Drum Pattern MIDI',
      description:
        'Renders a pre-built drum groove (GM drum map, channel 10) to a Standard MIDI File (SMF1, 480 PPQ, 4/4).',
      inputSchema: inputSchema.shape,
      outputSchema: outputSchema.shape,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    (input): CallToolResult => {
      const result = generateDrumPatternMidiHandler(input);
      return {
        content: [
          {
            type: 'text',
            text: `Drum MIDI: ${input.pattern}, ${input.bars} bar(s), ${input.tempo} BPM.`,
          },
        ],
        structuredContent: result,
      };
    },
  );
}
