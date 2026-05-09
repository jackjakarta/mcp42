import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import { detectKeyHandler } from './handler.js';
import { inputSchema, outputSchema } from './schemas.js';

const innerInputSchema = z.object({
  chords: z.array(z.string().min(1)).min(1).optional(),
  notes: z.array(z.string().min(1)).min(1).optional(),
});

export function registerDetectKeyTool(server: McpServer): void {
  server.registerTool(
    'detect-key',
    {
      title: 'Detect Key',
      description:
        'Ranks the top 5 candidate keys for a chord progression or note set. Provide exactly one of `chords` or `notes`.',
      inputSchema: innerInputSchema.shape,
      outputSchema: outputSchema.shape,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    (rawInput): CallToolResult => {
      const { chords, notes } = inputSchema.parse(rawInput);
      const result = detectKeyHandler(chords, notes);
      const top = result.candidates[0];
      const runners = result.candidates
        .slice(1)
        .map((c) => `${c.key} (${c.score})`)
        .join(', ');
      const text =
        top !== undefined
          ? `Top key: ${top.key} (score ${top.score}).${runners !== '' ? ` Runners-up: ${runners}.` : ''}`
          : 'No candidates.';
      return {
        content: [{ type: 'text', text }],
        structuredContent: result,
      };
    },
  );
}
