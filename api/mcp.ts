import { handleMcpRequest } from '../src/mcp/http.js';

/**
 * Vercel function for the MCP endpoint. `/mcp` is rewritten here by
 * vercel.json; this file never routes on the path, so it does not care which
 * form of the URL the platform reports.
 *
 * The default export is an object with a `fetch` method — Vercel's
 * Web-standard signature, and a catch-all over HTTP methods, so
 * `handleMcpRequest` keeps doing its own dispatch (405 on GET) exactly as it
 * does behind Hono. A bare `export default function handler(...)` would be
 * invoked as a Node.js `(req, res)` handler instead, and the returned
 * `Response` discarded.
 */
export default {
  fetch(request: Request): Promise<Response> {
    return handleMcpRequest(request);
  },
};
