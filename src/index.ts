import { serve } from '@hono/node-server';

import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 3000);

const server = serve({ fetch: createApp().fetch, port }, (info) => {
  console.log(`mcp-one listening on http://localhost:${info.port} (MCP at /mcp)`);
});

process.on('SIGINT', () => {
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});
