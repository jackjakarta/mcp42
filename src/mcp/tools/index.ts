import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerJokeTool } from './joke/index.js';

export function registerAllTools(server: McpServer): void {
  registerJokeTool(server);
}
