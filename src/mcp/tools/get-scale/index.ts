import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { getScaleHandler } from './handler.js';
import { inputSchema, outputSchema } from './schemas.js';

export function registerGetScaleTool(server: McpServer): void {
  server.registerTool(
    'get-scale',
    {
      title: 'Get Scale',
      description:
        'Returns notes, intervals, fitting chord types, and (for diatonic modes) the parent scale.',
      inputSchema: inputSchema.shape,
      outputSchema: outputSchema.shape,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    ({ tonic, type }): CallToolResult => {
      const info = getScaleHandler(tonic, type);
      const modeLine = info.modeOf !== undefined ? ` (mode of ${info.modeOf})` : '';
      return {
        content: [
          {
            type: 'text',
            text: `${tonic} ${type}${modeLine}: ${info.notes.join(' ')}`,
          },
        ],
        structuredContent: info,
      };
    },
  );
}
