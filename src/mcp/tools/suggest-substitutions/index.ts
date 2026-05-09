import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { suggestSubstitutionsHandler } from './handler.js';
import { inputSchema, outputSchema } from './schemas.js';

export function registerSuggestSubstitutionsTool(server: McpServer): void {
  server.registerTool(
    'suggest-substitutions',
    {
      title: 'Suggest Substitutions',
      description:
        'Suggests tritone substitution, secondary dominant, borrowed chords, and modal interchange for a chord in a key.',
      inputSchema: inputSchema.shape,
      outputSchema: outputSchema.shape,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    ({ chord, key }): CallToolResult => {
      const result = suggestSubstitutionsHandler(chord, key);
      const tritone = result.tritoneSub?.symbol ?? '-';
      const secV = result.secondaryDominant?.symbol ?? '-';
      return {
        content: [
          {
            type: 'text',
            text: `Subs for ${chord} in ${key}: tritone=${tritone}, secV=${secV}, borrowed=${result.borrowedChords.length}, modal=${result.modalInterchange.length}.`,
          },
        ],
        structuredContent: result,
      };
    },
  );
}
