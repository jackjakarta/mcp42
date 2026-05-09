import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import { transposeProgressionHandler } from './handler.js';
import { inputSchema, outputSchema } from './schemas.js';

const innerInputSchema = z.object({
  chords: z.array(z.string().min(1)).min(1),
  interval: z.string().min(1).optional(),
  targetKey: z.string().min(1).optional(),
});

export function registerTransposeProgressionTool(server: McpServer): void {
  server.registerTool(
    'transpose-progression',
    {
      title: 'Transpose Progression',
      description:
        'Transposes a chord progression by an interval or to a target tonic (relative to the first chord).',
      inputSchema: innerInputSchema.shape,
      outputSchema: outputSchema.shape,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    (rawInput): CallToolResult => {
      const { chords, interval, targetKey } = inputSchema.parse(rawInput);
      const result = transposeProgressionHandler(chords, interval, targetKey);
      return {
        content: [
          {
            type: 'text',
            text: `Transposed by ${result.interval}: ${result.chords.join(' ')}`,
          },
        ],
        structuredContent: result,
      };
    },
  );
}
