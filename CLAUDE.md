# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

A Hono HTTP server that exposes an MCP (Model Context Protocol) server at `/mcp`, plus a music-theory + MIDI domain layer and a Drizzle-managed Postgres knowledge graph. Layers are connected at `src/app.ts`:

- **Transport** — `src/index.ts` boots `@hono/node-server`; `src/app.ts` defines a Hono app with `/health` and a catch-all `/mcp` handler. The MCP endpoint uses `StreamableHTTPServerTransport` with `sessionIdGenerator: undefined`, i.e. **stateless per-request** — `createMcpServer()` + a fresh transport are constructed on every request, then torn down when the response socket closes (`ctx.env.outgoing.on('close', ...)`). Do not hoist the server/transport to module scope unless you also wire session management.
- **MCP server** — `src/mcp/server.ts` builds the `McpServer`. Tools live under `src/mcp/tools/` and are wired through a single `registerAllTools(server)` fan-out in `src/mcp/tools/index.ts`.
- **Tool layout** — Each tool is a subdirectory with three files: `index.ts` (calls `server.registerTool(...)` and adapts the handler result into `{ content, structuredContent }`), `handler.ts` (pure function that does the actual work and validates inputs/outputs with Zod), and `schemas.ts` (exports `inputSchema` and `outputSchema` as `z.object(...)` plus any inferred types). `src/mcp/tools/get-chord/` is a small reference; `src/mcp/tools/generate-progression-midi/` shows the MIDI-shaped variant. To add a tool: create `src/mcp/tools/<name>/` with this trio, export `register<Name>Tool(server)` from its `index.ts`, and call it from `registerAllTools`.
- **Tool schemas** — Defined with Zod. The SDK takes the `.shape` of the `z.object(...)` (not the object itself) for both `inputSchema` and `outputSchema`. Return `{ content: [...], structuredContent: {...} }` so clients get both the text rendering and the typed payload. Most tools set `annotations: { readOnlyHint: true, idempotentHint: true }`.
- **Domain layer (`src/music/`)** — Thin wrappers around `tonal` so handlers stay declarative and the underlying library stays swappable (`chords.ts`, `scales.ts`, `keys.ts`, `intervals.ts`, `progressions.ts`, `romanAnalysis.ts`, `voiceLeading.ts`, `substitutions.ts`, `cadences.ts`, `keyDetection.ts`, `transpose.ts`, …). Co-located `*.test.ts` files exercise the wrappers — handlers are intentionally thin so most logic should be tested here, not at the tool layer.
- **MIDI layer (`src/music/midi/`)** — Wrappers around `midi-writer-js` (`progressionToMidi`, `scaleToMidi`, `arpeggioToMidi`, `basslineToMidi`, `drumPatternToMidi`). Each returns a `Uint8Array` + metadata; the tool layer base64-encodes into `structuredContent`. Output convention: Standard MIDI File Type 1, 480 PPQ, no temp files. `midi-writer-js` ships without types — ambient declarations live in `src/types/midi-writer-js.d.ts`.
- **Database (`src/db/`)** — Drizzle ORM over `pg`. `src/db/index.ts` lazily constructs a `Pool` from `DATABASE_URL` and stashes it on `globalThis` in development so hot reloads don't leak connections; `casing: 'snake_case'` is set on the drizzle client. Schema lives in `src/db/schema/` (`app.ts`, `music.ts`); query helpers in `src/db/functions/`; migrations are emitted to `src/db/migrations/` by `drizzle-kit`. The music knowledge graph (progressions/modes/voicings/cadences) is defined in `src/db/schema/music.ts` and seeded from `src/db/seed/music.ts` (data under `src/db/seed/data/`).

Returning `RESPONSE_ALREADY_SENT` from the `/mcp` handler is required — the MCP transport writes directly to the Node response, bypassing Hono's response pipeline.

`.mcp.json` at the repo root points an MCP client at `http://localhost:3000/mcp` for local development.

`docs-src/` is a standalone Astro docs site (with its own `package.json`/`pnpm-lock.yaml`) that builds into `public/docs/`; `public/index.html` is the landing page. Neither is part of the MCP server runtime — don't touch them when working on tools, the domain layer, or the DB.

## Toolchain

- **Node**: `v24.14.1` (`.nvmrc`)
- **Package manager**: `pnpm@9.15.3` pinned via `packageManager` — do not use npm/yarn.
- **TypeScript**: `module: "Preserve"` + `moduleResolution: "Bundler"`, `isolatedModules` on. Every file must be independently transpilable — use `import type` for type-only imports. Relative imports **must use `.js` extensions** even though the sources are `.ts` (e.g. `./app.js`, `./mcp/server.js`, `./tools/get-chord/index.js`) — this is how `tsx` / the Preserve module mode resolves them.
- **Strictness**: `strict` + `noUncheckedIndexedAccess` — indexed access yields `T | undefined` and must be narrowed or fall back. That isn't defensive coding, it's required by the type system.
- **Env loading**: dev/start scripts shell out through `envee -f .env --` so `DATABASE_URL` etc. are available without a separate dotenv import. `pnpm db:migrate` and `pnpm start:prod` go through the same wrapper.

## Commands

From `package.json`:

- `pnpm dev` — `envee -f .env -- tsx watch src/index.ts` (hot reload, listens on `PORT` or 3000)
- `pnpm start` — one-shot `envee -f .env -- tsx src/index.ts` (TS via tsx, no build step)
- `pnpm build` — `rm -rf dist && tsc` (used by the Docker `runner` stage)
- `pnpm start:prod` — `envee -f .env -- node dist/index.js` (run after `pnpm build`)
- `pnpm types` — `tsc --noEmit`
- `pnpm lint` — `eslint .`
- `pnpm test` / `pnpm test:watch` — Vitest (`environment: "node"`, `passWithNoTests: true`)
- `pnpm format` / `pnpm format:check` — Prettier
- `pnpm db:generate` — `drizzle-kit generate` (writes SQL into `src/db/migrations/`)
- `pnpm db:migrate` — `drizzle-kit migrate` against `DATABASE_URL`
- `pnpm db:seed` — `tsx src/db/seed/music.ts`; loads curated KG data (progressions/modes/voicings/cadences). Optional but required for the `search-*` / `list-*` tools to return anything.
- `pnpm checks` — runs `scripts/checks.sh` (`format:check`, `lint`, `types`, `test`) — the same gates as the `static-checks.yml` GitHub Action.

Run a single test file / test name:

```
pnpm test path/to/file.test.ts
pnpm test -t "test name substring"
```

Local Postgres for development: `docker-compose up -d` (single `postgres` service on `:5432`, db `local-nextjs`, user/pass `postgres` / `h4yuasd6`). Set `DATABASE_URL` in `.env` to match.

`output-midi/` is gitignored — write generated `.mid` files there to verify in a DAW without polluting git.

## Linting & formatting

- **ESLint** (`eslint.config.mjs`): flat config extending `eslint.configs.recommended` + `typescript-eslint.configs.recommendedTypeChecked`. `projectService: true` enables type-aware rules — they need the TS project graph, so ESLint will be slow on first run and will fail if a file is outside `tsconfig.json`'s `include`.
- **Prettier** (`prettier.config.js`): uses `@jackjakarta/prettier-config` with the `nodejs({ packageJson: true })` preset — this bundles `prettier-plugin-packagejson` (so `package.json` is auto-sorted on format) and an import-sort plugin.

## Container

`Dockerfile` is a multi-stage build (`base` → `deps` → `builder` → `prod-deps` → `runner`) producing a `node:24.14.1-alpine` image that runs `node dist/index.js` as a non-root `nodejs` user, `EXPOSE 3000`. The `builder` stage runs `pnpm build`, so any change that breaks `tsc` will break the image build too.

## Libraries

When working with libraries always use the context7 MCP tools — never guess APIs from memory. This applies in particular to `tonal`, `midi-writer-js`, `drizzle-orm`, and `@modelcontextprotocol/sdk`, where APIs differ subtly between versions.

## Design

The design for this project's landing page and UI lives in Google Stitch.
Project URL: https://stitch.withgoogle.com/projects/9042073859738759270

You can use the mcp stitch tools to interact with the design when implementing it.
