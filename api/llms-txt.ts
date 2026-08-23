import { LLMS_TXT_TEXT } from '../src/utils/seo/llms.js';

export default function handler(): Response {
  return new Response(LLMS_TXT_TEXT, {
    status: 200,
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
