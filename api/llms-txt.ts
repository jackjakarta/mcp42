import { LLMS_TXT_TEXT } from '../src/utils/seo/llms.js';

/** Vercel function for `/llms.txt`. See api/health.ts for why this is `{ fetch }`. */
export default {
  fetch(): Response {
    return new Response(LLMS_TXT_TEXT, {
      status: 200,
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
  },
};
