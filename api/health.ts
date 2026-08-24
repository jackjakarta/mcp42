/**
 * Vercel function for the health check. The default export is an object with a
 * `fetch` method — Vercel's Web-standard signature. A bare `export default
 * function handler(...)` would instead be invoked as a Node.js `(req, res)`
 * handler, and a returned `Response` would be ignored, hanging the request.
 */
export default {
  fetch(): Response {
    return Response.json({ ok: true });
  },
};
