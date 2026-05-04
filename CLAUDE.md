# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

A Hono HTTP server that exposes an MCP (Model Context Protocol) server at `/mcp`. Two layers, connected at `src/app.ts`:

- **Transport** — `src/index.ts` boots `@hono/node-server`; `src/app.ts` defines a Hono app with `/health` and a catch-all `/mcp` handler. The MCP endpoint uses `StreamableHTTPServerTransport` with `sessionIdGenerator: undefined`, i.e. **stateless per-request** — `createMcpServer()` + a fresh transport are constructed on every request, then torn down when the response socket closes (`ctx.env.outgoing.on('close', ...)`). Do not hoist the server/transport to module scope unless you also wire session management.
- **MCP server** — `src/mcp/server.ts` builds the `McpServer`. Tools live under `src/mcp/tools/` and are wired through a single `registerAllTools(server)` fan-out in `src/mcp/tools/index.ts`.
- **Tool layout** — Each tool is a subdirectory with three files: `index.ts` (calls `server.registerTool(...)` and adapts the handler result into `{ content, structuredContent }`), `handler.ts` (pure async function that does the actual work, e.g. fetches an upstream API and validates the response with Zod), and `schemas.ts` (exports `inputSchema` and `outputSchema` as `z.object(...)` plus any inferred types). See `src/mcp/tools/joke/` for the reference example. To add a tool: create `src/mcp/tools/<name>/` with this trio, export `register<Name>Tool(server)` from its `index.ts`, and call it from `registerAllTools`.
- **Tool schemas** — Defined with Zod. The SDK takes the `.shape` of the `z.object(...)` (not the object itself) for both `inputSchema` and `outputSchema`. Return `{ content: [...], structuredContent: {...} }` so clients get both the text rendering and the typed payload.

Returning `RESPONSE_ALREADY_SENT` from the `/mcp` handler is required — the MCP transport writes directly to the Node response, bypassing Hono's response pipeline.

`.mcp.json` at the repo root points an MCP client at `http://localhost:3000/mcp` for local development.

## Toolchain

- **Node**: `v24.14.1` (`.nvmrc`)
- **Package manager**: `pnpm@9.15.3` pinned via `packageManager` — do not use npm/yarn.
- **TypeScript**: `module: "Preserve"` + `moduleResolution: "Bundler"`, `isolatedModules` on. Every file must be independently transpilable — use `import type` for type-only imports. Relative imports **must use `.js` extensions** even though the sources are `.ts` (see `./app.js`, `./mcp/server.js`, `./tools/joke/index.js` in existing code) — this is how `tsx` / the Preserve module mode resolves them.
- **Strictness**: `strict` + `noUncheckedIndexedAccess` — indexed access yields `T | undefined` and must be narrowed or fall back. That isn't defensive coding, it's required by the type system.

## Commands

From `package.json`:

- `pnpm dev` — `tsx watch src/index.ts` (hot reload, listens on `PORT` or 3000)
- `pnpm start` — one-shot `tsx src/index.ts` (TS via tsx, no build step)
- `pnpm build` — `tsc` (emits to `dist/`, used by the Docker `runner` stage)
- `pnpm start:prod` — `node dist/index.js` (run after `pnpm build`)
- `pnpm types` — `tsc --noEmit`
- `pnpm lint` — `eslint .`
- `pnpm test` / `pnpm test:watch` — Vitest (`environment: "node"`, `passWithNoTests: true`)
- `pnpm format` / `pnpm format:check` — Prettier

`scripts/checks.sh` runs `format:check`, `lint`, `types`, `test` in sequence — the same gates as the `static-checks.yml` GitHub Action.

Run a single test file / test name:

```
pnpm test path/to/file.test.ts
pnpm test -t "test name substring"
```

## Linting & formatting

- **ESLint** (`eslint.config.mjs`): flat config extending `eslint.configs.recommended` + `typescript-eslint.configs.recommendedTypeChecked`. `projectService: true` enables type-aware rules — they need the TS project graph, so ESLint will be slow on first run and will fail if a file is outside `tsconfig.json`'s `include`.
- **Prettier** (`prettier.config.js`): uses `@jackjakarta/prettier-config` with the `nodejs({ packageJson: true })` preset — this bundles `prettier-plugin-packagejson` (so `package.json` is auto-sorted on format) and an import-sort plugin.

## Container

`Dockerfile` is a multi-stage build (`base` → `deps` → `builder` → `prod-deps` → `runner`) producing a `node:24.14.1-alpine` image that runs `node dist/index.js` as a non-root `nodejs` user, `EXPOSE 3000`. The `builder` stage runs `pnpm build`, so any change that breaks `tsc` will break the image build too.
