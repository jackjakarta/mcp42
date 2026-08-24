import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';

import { createMcpServer } from './server.js';

/**
 * CORS headers a browser-based MCP client (claude.ai's custom connector, the
 * MCP inspector) needs before it will send the POST at all. This endpoint is
 * unauthenticated, so `*` is the honest origin policy — and it rules out
 * credentialed requests, which is exactly right here. The expose list is what
 * lets a client read the protocol/session headers back off the response.
 */
const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Accept, Authorization, Last-Event-ID, MCP-Protocol-Version, Mcp-Session-Id',
  'Access-Control-Expose-Headers': 'MCP-Protocol-Version, Mcp-Session-Id',
  'Access-Control-Max-Age': '86400',
};

/** Adds the CORS headers in place. Every exit from the handler goes through this. */
function withCors(response: Response): Response {
  for (const [name, value] of Object.entries(CORS_HEADERS)) {
    response.headers.set(name, value);
  }

  return response;
}

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
  if (request.method === 'OPTIONS') {
    // The CORS preflight has to be answered here and not by the transport: the
    // transport rejects unknown methods with 405, which a browser reads as a
    // failed preflight and never retries, so the real POST is never sent.
    return withCors(new Response(null, { status: 204 }));
  }

  if (request.method === 'GET') {
    // In stateless mode the SDK answers GET by opening a standalone SSE stream
    // and holding it until the client disconnects. A per-request server never
    // pushes anything to it, and on serverless that idle stream costs a whole
    // invocation, so refuse it the way the spec allows.
    return withCors(
      new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          error: { code: -32000, message: 'Method not allowed.' },
          id: null,
        }),
        {
          status: 405,
          headers: { Allow: 'POST, DELETE, OPTIONS', 'Content-Type': 'application/json' },
        },
      ),
    );
  }

  const server = createMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);

  try {
    return withCors(await transport.handleRequest(request));
  } finally {
    await transport.close();
    await server.close();
  }
}
