import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { analyzeProgressionHandler } from './handler.js';
import { inputSchema, outputSchema } from './schemas.js';

export function registerAnalyzeProgressionTool(server: McpServer): void {
  server.registerTool(
    'analyze-progression',
    {
      title: 'Analyze Progression',
      description:
        'Analyzes a chord progression: returns the key, Roman numerals per chord, and detected cadences.',
      inputSchema: inputSchema.shape,
      outputSchema: outputSchema.shape,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    ({ chords, keyHint }): CallToolResult => {
      const result = analyzeProgressionHandler(chords, keyHint);
      const cadenceText =
        result.cadences.length === 0
          ? 'none'
          : result.cadences
              .map((c) => `${c.romans[0]}->${c.romans[1]} (${c.type}) at ${c.index}`)
              .join(', ');
      return {
        content: [
          {
            type: 'text',
            text: `Key: ${result.key}. Romans: ${result.romanNumerals.join('-')}. Cadences: ${cadenceText}.`,
          },
        ],
        structuredContent: result,
      };
    },
  );
}
