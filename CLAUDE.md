# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

A Hono HTTP server that exposes an MCP (Model Context Protocol) server at `/mcp`, plus a music-theory + MIDI domain layer and a Drizzle-managed SQLite knowledge graph. Layers are connected at `src/app.ts`:

- **Transport** — `src/mcp/http.ts` owns the MCP endpoint as a runtime-agnostic `handleMcpRequest(request: Request): Promise<Response>`, built on `WebStandardStreamableHTTPServerTransport` with `sessionIdGenerator: undefined` (**stateless per-request**) and `enableJsonResponse: true` (a single buffered JSON reply instead of an SSE stream, which is what makes tearing the server down right after `handleRequest` safe). `createMcpServer()` + a fresh transport are constructed and closed on every call — do not hoist them to module scope unless you also wire session management. `GET /mcp` is answered with 405: in stateless mode the SDK would otherwise open a standalone SSE stream that nothing ever pushes to. Two thin entry points call it: `src/index.ts` → `src/app.ts` (Hono on `@hono/node-server`, also serves `public/`) for local dev and the container, and `api/mcp.ts` for Vercel.
- **MCP server** — `src/mcp/server.ts` builds the `McpServer`. Tools live under `src/mcp/tools/` and are wired through a single `registerAllTools(server)` fan-out in `src/mcp/tools/index.ts`.
- **Tool layout** — Each tool is a subdirectory with three files: `index.ts` (calls `server.registerTool(...)` and adapts the handler result into `{ content, structuredContent }`), `handler.ts` (pure function that does the actual work and validates inputs/outputs with Zod), and `schemas.ts` (exports `inputSchema` and `outputSchema` as `z.object(...)` plus any inferred types). `src/mcp/tools/get-chord/` is a small reference; `src/mcp/tools/generate-progression-midi/` shows the MIDI-shaped variant. To add a tool: create `src/mcp/tools/<name>/` with this trio, export `register<Name>Tool(server)` from its `index.ts`, and call it from `registerAllTools`.
- **Tool schemas** — Defined with Zod. The SDK takes the `.shape` of the `z.object(...)` (not the object itself) for both `inputSchema` and `outputSchema`. Return `{ content: [...], structuredContent: {...} }` so clients get both the text rendering and the typed payload. Most tools set `annotations: { readOnlyHint: true, idempotentHint: true }`.
- **Domain layer (`src/music/`)** — Thin wrappers around `tonal` so handlers stay declarative and the underlying library stays swappable (`chords.ts`, `scales.ts`, `keys.ts`, `intervals.ts`, `progressions.ts`, `romanAnalysis.ts`, `voiceLeading.ts`, `substitutions.ts`, `cadences.ts`, `keyDetection.ts`, `transpose.ts`, …). Co-located `*.test.ts` files exercise the wrappers — handlers are intentionally thin so most logic should be tested here, not at the tool layer.
- **MIDI layer (`src/music/midi/`)** — Wrappers around `midi-writer-js` (`progressionToMidi`, `scaleToMidi`, `arpeggioToMidi`, `basslineToMidi`, `drumPatternToMidi`). Each returns a `Uint8Array` + metadata; the tool layer base64-encodes into `structuredContent`. Output convention: Standard MIDI File Type 1, 480 PPQ, no temp files. `midi-writer-js` ships without types — ambient declarations live in `src/types/midi-writer-js.d.ts`.
- **Database (`src/db/`)** — Drizzle ORM over `better-sqlite3`. `src/db/index.ts` lazily opens `SQLITE_PATH` (default `./data/music.db`) and memoizes both the `Database` handle and the drizzle client on `globalThis` — the memoization is unconditional on purpose: `db` is a `Proxy` that calls `getDb()` on every property access, so skipping the cache opens a fresh handle per access. `casing: 'snake_case'` is set on the drizzle client. `VERCEL=1` (set by the platform) selects a read-only handle that skips the WAL pragma, for hosts whose filesystem can't hold the `-wal`/`-shm` sidecars; `SQLITE_READONLY` overrides that in **both** directions — `1` for any other read-only host, `0` to force a writable handle even on Vercel, which is what lets `db:seed` run inside `vercel-build`. `src/db/drizzle.config.ts` reads the same `SQLITE_PATH` and `mkdir -p`s its parent, since `data/` is gitignored and so absent on a fresh clone and in CI. Schema lives in `src/db/schema/music.ts`; query helpers in `src/db/functions/`; migrations are emitted to `src/db/migrations/` by `drizzle-kit`. The music knowledge graph (progressions/modes/voicings/cadences) is defined in `src/db/schema/music.ts` and seeded from `src/db/seed/music.ts` (data under `src/db/seed/data/`).

The MCP handler must stay on Web `Request`/`Response` only — no `ctx.env.incoming`/`outgoing`, no `RESPONSE_ALREADY_SENT`. That is what lets the same code serve the Node server and a Vercel function; reaching for the Node-flavoured `StreamableHTTPServerTransport` would break the serverless entry point.

`.mcp.json` at the repo root points an MCP client at `http://localhost:3000/mcp` for local development.

`docs-src/` is a standalone Astro docs site (with its own `package.json`/`pnpm-lock.yaml`) that builds into `public/docs/`; `public/index.html` is the landing page. Neither is part of the MCP server runtime — don't touch them when working on tools, the domain layer, or the DB.

## Toolchain

- **Node**: `v24.14.1` (`.nvmrc`)
- **Package manager**: `pnpm@9.15.3` pinned via `packageManager` — do not use npm/yarn.
- **TypeScript**: `module: "Preserve"` + `moduleResolution: "Bundler"`, `isolatedModules` on. Every file must be independently transpilable — use `import type` for type-only imports. Relative imports **must use `.js` extensions** even though the sources are `.ts` (e.g. `./app.js`, `./mcp/server.js`, `./tools/get-chord/index.js`) — this is how `tsx` / the Preserve module mode resolves them.
- **Strictness**: `strict` + `noUncheckedIndexedAccess` — indexed access yields `T | undefined` and must be narrowed or fall back. That isn't defensive coding, it's required by the type system.
- **Env loading**: dev/start scripts shell out through `envee -f .env --` so `SQLITE_PATH` etc. are available without a separate dotenv import. `pnpm db:migrate` and `pnpm start:prod` go through the same wrapper.

## Commands

From `package.json`:

- `pnpm dev` — `envee -f .env -- tsx watch src/index.ts` (hot reload, listens on `PORT` or 3000)
- `pnpm start` — one-shot `envee -f .env -- tsx src/index.ts` (TS via tsx, no build step)
- `pnpm build` — `rm -rf dist public/docs && tsc && pnpm docs:build` (used by the Docker `builder` stage)
- `pnpm start:prod` — `envee -f .env -- node dist/index.js` (run after `pnpm build`)
- `pnpm types` — `tsc --noEmit && tsc -p api --noEmit` (the Vercel entry points live outside `tsconfig.json`'s `include`, so they have their own `api/tsconfig.json`)
- `pnpm lint` — `eslint .`
- `pnpm test` / `pnpm test:watch` — Vitest (`environment: "node"`, `passWithNoTests: true`)
- `pnpm format` / `pnpm format:check` — Prettier
- `pnpm db:generate` — `drizzle-kit generate` (writes SQL into `src/db/migrations/`)
- `pnpm db:migrate` — `drizzle-kit migrate` against the SQLite file in `src/db/drizzle.config.ts`
- `pnpm db:seed` — `tsx src/db/seed/music.ts`; loads curated KG data (progressions/modes/voicings/cadences). Optional but required for the `search-*` / `list-*` tools to return anything.
- `pnpm db:snapshot` — `tsx scripts/prepare-sqlite.ts`; switches the seeded file out of WAL mode and vacuums it so it can be read from a read-only filesystem. Part of `vercel-build`.
- `pnpm vercel-build` — what Vercel runs: `docs:build` + `db:migrate` + `db:seed` + `db:snapshot`.
- `pnpm checks` — runs `scripts/checks.sh` (`format:check`, `lint`, `types`, `test`) — the same gates as the `static-checks.yml` GitHub Action.

Run a single test file / test name:

```
pnpm test path/to/file.test.ts
pnpm test -t "test name substring"
```

No database service to run locally — `pnpm db:migrate && pnpm db:seed` creates and fills `data/music.db` (gitignored). Point `SQLITE_PATH` elsewhere if you want a scratch copy.

`output-midi/` is gitignored — write generated `.mid` files there to verify in a DAW without polluting git.

## Linting & formatting

- **ESLint** (`eslint.config.mjs`): flat config extending `eslint.configs.recommended` + `typescript-eslint.configs.recommendedTypeChecked`. `projectService: true` enables type-aware rules — they need the TS project graph, so ESLint will be slow on first run and will fail if a file is outside `tsconfig.json`'s `include`.
- **Prettier** (`prettier.config.js`): uses `@jackjakarta/prettier-config` with the `nodejs({ packageJson: true })` preset — this bundles `prettier-plugin-packagejson` (so `package.json` is auto-sorted on format) and an import-sort plugin.

## Deployment

Two targets share `createApp()`/`handleMcpRequest`:

- **Container** (`Dockerfile`, tagged releases via `.github/workflows/build-and-deploy-prod.yml`) — writable filesystem, WAL mode, `public/` served by Hono.
- **Vercel** (`vercel.json` + `api/`) — `public/` is served by the CDN as `outputDirectory`, and `rewrites` map `/mcp`, `/health` and `/llms.txt` onto one function each. The functions never route on the request path, so they don't care which URL form the platform reports. `data/music.db` is built during `vercel-build` and shipped via `functions.includeFiles`; `better-sqlite3`'s native binding is picked up by Vercel's file tracer through the `bindings` package, so it needs no `includeFiles` entry of its own. The read-only DB path is what `VERCEL=1` selects.

## Container

`Dockerfile` is a multi-stage build (`base` → `deps` → `builder` → `prod-deps` → `runner`) producing a `node:24.14.1-alpine` image that runs `node dist/index.js` as a non-root `nodejs` user, `EXPOSE 3000`. The `builder` stage runs `pnpm build`, so any change that breaks `tsc` will break the image build too.

## Libraries

When working with libraries always use the context7 MCP tools — never guess APIs from memory. This applies in particular to `tonal`, `midi-writer-js`, `drizzle-orm`, and `@modelcontextprotocol/sdk`, where APIs differ subtly between versions.

## Design

The design for this project's landing page and UI lives in Google Stitch.
Project URL: https://stitch.withgoogle.com/projects/9042073859738759270

You can use the mcp stitch tools to interact with the design when implementing it.
