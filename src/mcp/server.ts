import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerAllTools } from './tools/index.js';

export function createMcpServer(): McpServer {
  const server = new McpServer({ name: 'mcpFortyTwo', version: '0.1.0' });
  registerAllTools(server);
  return server;
}
