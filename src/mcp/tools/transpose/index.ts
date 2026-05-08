import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import { transposeToolHandler } from './handler.js';
import { inputSchema, outputSchema } from './schemas.js';

const innerInputSchema = z.object({
  subject: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
  interval: z.string().min(1).optional(),
  targetKey: z.string().min(1).optional(),
});

export function registerTransposeTool(server: McpServer): void {
  server.registerTool(
    'transpose',
    {
      title: 'Transpose',
      description:
        'Transposes a note, chord, or chord progression by an interval or to a target key.',
      inputSchema: innerInputSchema.shape,
      outputSchema: outputSchema.shape,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    (rawInput): CallToolResult => {
      const { subject, interval, targetKey } = inputSchema.parse(rawInput);
      const result = transposeToolHandler(subject, interval, targetKey);
      const valueText = Array.isArray(result.value) ? result.value.join(' ') : result.value;
      return {
        content: [
          {
            type: 'text',
            text: `Transposed by ${result.interval}: ${valueText}`,
          },
        ],
        structuredContent: result,
      };
    },
  );
}
