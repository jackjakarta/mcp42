# mcpFortyTwo

An [MCP](https://modelcontextprotocol.io/) server for music theory analysis and MIDI generation. Ask Claude (or any MCP-capable client) to spell chords, detect keys, suggest reharmonizations, generate basslines, drum patterns, scales and full progressions as Standard MIDI Files — all without leaving the chat.

Built on [Hono](https://hono.dev/), [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk), [`tonal`](https://github.com/tonaljs/tonal) and [`midi-writer-js`](https://github.com/grimmdude/MidiWriterJS), with a Drizzle/Postgres knowledge graph for curated progressions, modes, voicings and cadences.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

## Tools

The server registers 24 tools, grouped roughly as:

**Music theory**

- `get-chord`, `get-scale`, `get-key`, `get-mode`, `get-interval`, `get-note-info`
- `get-diatonic-chords`, `get-progression`, `analyze-progression`, `analyze-voice-leading`
- `detect-key`, `transpose`, `transpose-progression`, `suggest-substitutions`

**Knowledge graph queries**

- `search-progressions`, `search-modes`, `list-cadences`, `list-voicings`

**MIDI generation** (returns base64-encoded Standard MIDI File Type 1, 480 PPQ)

- `generate-progression-midi`, `generate-scale-midi`, `generate-arpeggio-midi`
- `generate-bassline-midi`, `generate-drum-pattern-midi`

Every tool defines a Zod input/output schema and returns both a text rendering and a typed `structuredContent` payload.

## Quickstart

### Use the hosted server

A public instance runs at **`https://mcp42.jackjakarta.xyz/mcp`**. Point any MCP client at that URL over Streamable HTTP — no install required.

### Claude Desktop / Claude Code

Add to your MCP client config (`~/.claude/mcp.json`, Claude Desktop's `claude_desktop_config.json`, or any compatible client):

```json
{
  "mcpServers": {
    "mcpFortyTwo": {
      "type": "http",
      "url": "https://mcp42.jackjakarta.xyz/mcp"
    }
  }
}
```

To run against a local instance, swap the URL for `http://localhost:3000/mcp`.

### Example tool call

Call `get-chord` with `{ "symbol": "Cmaj7" }`:

```json
{
  "root": "C",
  "quality": "Major Seventh",
  "notes": ["C", "E", "G", "B"],
  "intervals": ["1P", "3M", "5P", "7M"],
  "extensions": ["7M"]
}
```

`generate-progression-midi` returns the same shape plus a base64 `midi` field that decodes to a `.mid` file you can drop into any DAW.

## Local development

Requirements: Node `v24.14.1` (see `.nvmrc`), `pnpm@9.15.3`, Docker (for Postgres).

```bash
pnpm install
docker-compose up -d            # local Postgres on :5432
cp .env.example .env            # then edit DATABASE_URL — see below
pnpm db:migrate
pnpm db:seed                    # optional: load curated progressions/modes/voicings/cadences
pnpm dev                        # tsx watch on PORT or 3000
```

Health check: `curl http://localhost:3000/health` → `{"ok":true}`.

### Environment

A single variable is required:

```
DATABASE_URL=postgres://postgres:h4yuasd6@localhost:5432/local-nextjs
PORT=3000   # optional, defaults to 3000
```

The `docker-compose.yml` ships a Postgres matching those credentials.

### Scripts

| Command                             | What it does                                            |
| ----------------------------------- | ------------------------------------------------------- |
| `pnpm dev`                          | Hot-reload dev server via `tsx watch`                   |
| `pnpm start`                        | One-shot run via `tsx` (no build)                       |
| `pnpm build`                        | `tsc` to `dist/`                                        |
| `pnpm start:prod`                   | Run the compiled output                                 |
| `pnpm types`                        | Type-check only                                         |
| `pnpm lint`                         | ESLint (type-aware)                                     |
| `pnpm test` / `pnpm test:watch`     | Vitest                                                  |
| `pnpm format` / `pnpm format:check` | Prettier                                                |
| `pnpm db:generate`                  | Emit a new Drizzle migration                            |
| `pnpm db:migrate`                   | Apply migrations                                        |
| `pnpm db:seed`                      | Seed the music knowledge graph                          |
| `pnpm checks`                       | `format:check` + `lint` + `types` + `test` (matches CI) |

## Architecture

```
┌─────────────────────────┐
│  Hono HTTP server       │  src/index.ts, src/app.ts
│   /health, /mcp         │
└──────────┬──────────────┘
           │ StreamableHTTPServerTransport (stateless per-request)
┌──────────▼──────────────┐
│  McpServer              │  src/mcp/server.ts
│   registerAllTools()    │  src/mcp/tools/<name>/{index,handler,schemas}.ts
└──────────┬──────────────┘
           │
┌──────────▼──────────────┐    ┌─────────────────────────┐
│  Music domain (tonal)   │    │  MIDI domain            │
│  src/music/*.ts         │    │  src/music/midi/*.ts    │
│   chords, scales, keys, │    │   progression, scale,   │
│   intervals, voice-     │    │   arpeggio, bassline,   │
│   leading, substitutions│    │   drum-pattern → SMF1   │
└──────────┬──────────────┘    └─────────────────────────┘
           │
┌──────────▼──────────────┐
│  Postgres (Drizzle)     │  src/db/{schema,functions,migrations,seed}
│  music knowledge graph  │
└─────────────────────────┘
```

Each MCP request gets a fresh `McpServer` + `StreamableHTTPServerTransport` (`sessionIdGenerator: undefined`) and tears them down on socket close. The Hono handler returns `RESPONSE_ALREADY_SENT` because the transport writes directly to the Node response.

### Adding a tool

Create `src/mcp/tools/<name>/` with three files:

- `schemas.ts` — `inputSchema` and `outputSchema` as `z.object(...)`
- `handler.ts` — pure function, validates with the schemas, contains the actual logic
- `index.ts` — calls `server.registerTool(...)`, adapts the handler result into `{ content, structuredContent }`

Then export `register<Name>Tool` from `index.ts` and call it from `src/mcp/tools/index.ts`. `src/mcp/tools/get-chord/` is a small reference; `generate-progression-midi/` shows the MIDI-shaped variant.

Keep handlers thin — most logic belongs in `src/music/` next to its `*.test.ts`.

## Docker

```bash
docker build -t mcp-forty-two .
docker run --rm -p 3000:3000 -e DATABASE_URL=... mcp-forty-two
```

Multi-stage build on `node:24.14.1-alpine`, runs as non-root `nodejs`, exposes `3000`.

## Tech stack

- **Runtime**: Node 24, Hono, `@hono/node-server`
- **MCP**: `@modelcontextprotocol/sdk` over Streamable HTTP
- **Music**: `tonal`, `midi-writer-js`
- **Validation**: Zod
- **Database**: Postgres + Drizzle ORM
- **Tooling**: TypeScript (`module: Preserve`), ESLint (type-aware), Prettier, Vitest, `tsx`

## License

MIT
