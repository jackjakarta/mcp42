import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';

import { handleMcpRequest } from './mcp/http.js';
import { LLMS_TXT_TEXT } from './utils/seo/llms.js';

export function createApp() {
  const app = new Hono();

  app.use('/*', serveStatic({ root: './public', index: 'index.html' }));

  app.get('/health', (ctx) => ctx.json({ ok: true }));

  app.get('/llms.txt', (ctx) =>
    ctx.text(LLMS_TXT_TEXT, 200, { 'Content-Type': 'text/markdown; charset=utf-8' }),
  );

  app.all('/mcp', (ctx) => handleMcpRequest(ctx.req.raw));

  return app;
}
