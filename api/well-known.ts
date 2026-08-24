/**
 * Vercel function for `/.well-known/*`.
 *
 * Vercel's static layer answers unmatched paths with `public/index.html` and a
 * 200, so an OAuth discovery probe — which is the first thing a connector does
 * against a new MCP URL — gets the landing page back and fails trying to read
 * HTML as authorization-server metadata. This server is unauthenticated, so the
 * correct answer to those probes is a miss. See api/health.ts for why this is
 * `{ fetch }` rather than a bare default-exported function.
 */
export default {
  fetch(): Response {
    return Response.json(
      { error: 'Not found.' },
      { status: 404, headers: { 'Cache-Control': 'no-store' } },
    );
  },
};
