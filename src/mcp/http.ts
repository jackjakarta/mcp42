import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';

import { createMcpServer } from './server.js';

/**
 * Runtime-agnostic MCP endpoint: Web `Request` in, Web `Response` out, so the
 * same handler backs the Node server (src/app.ts) and a Vercel function
 * (api/mcp.ts) without either one leaking into the other.
 *
 * Stateless per request — a fresh McpServer plus transport are built, used and
 * torn down on every call. `enableJsonResponse` makes the reply a single
 * buffered JSON body rather than an SSE stream, which is what makes tearing the
 * server down as soon as `handleRequest` resolves safe.
 */
export async function handleMcpRequest(request: Request): Promise<Response> {
  if (request.method === 'GET') {
    // In stateless mode the SDK answers GET by opening a standalone SSE stream
    // and holding it until the client disconnects. A per-request server never
    // pushes anything to it, and on serverless that idle stream costs a whole
    // invocation, so refuse it the way the spec allows.
    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Method not allowed.' },
        id: null,
      }),
      {
        status: 405,
        headers: { Allow: 'POST, DELETE', 'Content-Type': 'application/json' },
      },
    );
  }

  const server = createMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);

  try {
    return await transport.handleRequest(request);
  } finally {
    await transport.close();
    await server.close();
  }
}
