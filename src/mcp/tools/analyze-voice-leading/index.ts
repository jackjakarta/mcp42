import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { analyzeVoiceLeadingHandler } from './handler.js';
import { inputSchema, outputSchema } from './schemas.js';

export function registerAnalyzeVoiceLeadingTool(server: McpServer): void {
  server.registerTool(
    'analyze-voice-leading',
    {
      title: 'Analyze Voice Leading',
      description:
        'Compares two chord voicings (paired strictly by index) and flags parallel 5ths/octaves and leaps > octave.',
      inputSchema: inputSchema.shape,
      outputSchema: outputSchema.shape,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    ({ from, to }): CallToolResult => {
      const result = analyzeVoiceLeadingHandler(from, to);
      const summary =
        result.warnings.length === 0
          ? 'no warnings'
          : `${result.warnings.length} warning(s): ${result.warnings.map((w) => w.type).join(', ')}`;
      return {
        content: [
          {
            type: 'text',
            text: `${from.chord}->${to.chord}: ${summary}.`,
          },
        ],
        structuredContent: result,
      };
    },
  );
}
