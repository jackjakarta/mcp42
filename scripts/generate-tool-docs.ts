/**
 * Generate one MDX page per registered MCP tool into
 * docs-src/src/content/docs/tools/. Reads the same registerTool() calls
 * the live server uses, so the docs cannot drift from the code.
 *
 * Run with `pnpm docs:gen`. Idempotent — re-emits the whole directory each run.
 */

import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z, type ZodRawShape } from 'zod';

import { registerAllTools } from '../src/mcp/tools/index.js';

type ToolAnnotations = {
  readOnlyHint?: boolean;
  idempotentHint?: boolean;
  destructiveHint?: boolean;
  openWorldHint?: boolean;
  title?: string;
};

type ToolRecord = {
  name: string;
  title?: string;
  description?: string;
  inputSchema?: ZodRawShape;
  outputSchema?: ZodRawShape;
  annotations?: ToolAnnotations;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUT_DIR = resolve(__dirname, '..', 'docs-src', 'src', 'content', 'docs', 'tools');

const recordings: ToolRecord[] = [];

const fakeServer = {
  registerTool(name: string, def: Record<string, unknown>, _handler: unknown) {
    recordings.push({ name, ...(def as Omit<ToolRecord, 'name'>) });
  },
};

registerAllTools(fakeServer as unknown as McpServer);

mkdirSync(OUT_DIR, { recursive: true });
for (const f of readdirSync(OUT_DIR)) {
  if (f.endsWith('.mdx') && f !== 'index.mdx') {
    unlinkSync(resolve(OUT_DIR, f));
  }
}

const yesNo = (v: boolean | undefined) => (v ? '✓' : '—');

const escapeYaml = (s: string) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

const renderSchema = (shape: ZodRawShape | undefined): string => {
  if (!shape) return '_(none)_\n';
  const json = z.toJSONSchema(z.object(shape));
  return '```json\n' + JSON.stringify(json, null, 2) + '\n```\n';
};

const renderMdx = (t: ToolRecord): string => {
  const title = t.title ?? t.name;
  const description = (t.description ?? '').replace(/\s+/g, ' ').trim();
  const a = t.annotations ?? {};

  return [
    '---',
    `title: ${title}`,
    `description: "${escapeYaml(description)}"`,
    '---',
    '',
    `**Tool name:** \`${t.name}\``,
    '',
    description,
    '',
    '## Annotations',
    '',
    '| Hint            | Value |',
    '| --------------- | :---: |',
    `| readOnlyHint    | ${yesNo(a.readOnlyHint)} |`,
    `| idempotentHint  | ${yesNo(a.idempotentHint)} |`,
    `| destructiveHint | ${yesNo(a.destructiveHint)} |`,
    `| openWorldHint   | ${yesNo(a.openWorldHint)} |`,
    '',
    '## Input',
    '',
    renderSchema(t.inputSchema),
    '## Output',
    '',
    'Returned as `structuredContent`. The text rendering is a short human-readable summary.',
    '',
    renderSchema(t.outputSchema),
  ].join('\n');
};

for (const t of recordings) {
  writeFileSync(resolve(OUT_DIR, `${t.name}.mdx`), renderMdx(t));
}

console.log(`Generated ${recordings.length} tool page(s) in ${OUT_DIR}`);
