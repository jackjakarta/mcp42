import { handleMcpRequest } from '../src/mcp/http.js';

/**
 * Vercel function for the MCP endpoint. `/mcp` is rewritten here by
 * vercel.json; this file never routes on the path, so it does not care which
 * form of the URL the platform reports.
 */
export default function handler(request: Request): Promise<Response> {
  return handleMcpRequest(request);
}
