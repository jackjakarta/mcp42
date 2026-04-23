import type { HttpBindings } from '@hono/node-server';
import { RESPONSE_ALREADY_SENT } from '@hono/node-server/utils/response';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { Hono } from 'hono';

import { createMcpServer } from './mcp/server.js';

export function createApp() {
  const app = new Hono<{ Bindings: HttpBindings }>();

  app.get('/health', (c) => c.json({ ok: true }));

  app.all('/mcp', async (c) => {
    const server = createMcpServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    await server.connect(transport);

    const body = c.req.header('content-type')?.includes('application/json')
      ? await c.req.json().catch(() => undefined)
      : undefined;

    c.env.outgoing.on('close', () => {
      void transport.close();
      void server.close();
    });

    await transport.handleRequest(c.env.incoming, c.env.outgoing, body);
    return RESPONSE_ALREADY_SENT;
  });

  return app;
}
