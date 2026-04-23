import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerWeatherTool } from './weather.js';

export function registerAllTools(server: McpServer): void {
  registerWeatherTool(server);
}
