import { type HttpBindings } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { RESPONSE_ALREADY_SENT } from '@hono/node-server/utils/response';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { Hono } from 'hono';

import { createMcpServer } from './mcp/server.js';

export function createApp() {
  const app = new Hono<{ Bindings: HttpBindings }>();

  app.get('/health', (ctx) => ctx.json({ ok: true }));

  app.all('/mcp', async (ctx) => {
    const server = createMcpServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    await server.connect(transport);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = ctx.req.header('content-type')?.includes('application/json')
      ? await ctx.req.json().catch(() => undefined)
      : undefined;

    ctx.env.outgoing.on('close', () => {
      void transport.close();
      void server.close();
    });

    await transport.handleRequest(ctx.env.incoming, ctx.env.outgoing, body);
    return RESPONSE_ALREADY_SENT;
  });

  app.use('/*', serveStatic({ root: './public', index: 'index.html' }));

  return app;
}
