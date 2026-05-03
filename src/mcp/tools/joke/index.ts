import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { getJokeHandler } from './handler.js';
import { inputSchema, outputSchema } from './schemas.js';

export function registerJokeTool(server: McpServer): void {
  server.registerTool(
    'get-joke',
    {
      title: 'Get Random Chuck Norris Joke',
      description: 'Get a random Chuck Norris joke by cateogry.',
      inputSchema: inputSchema.shape,
      outputSchema: outputSchema.shape,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async ({ category }): Promise<CallToolResult> => {
      const joke = await getJokeHandler(category);

      return {
        content: [{ type: 'text', text: `The joke is: ${joke}` }],
        structuredContent: { joke },
      };
    },
  );
}
