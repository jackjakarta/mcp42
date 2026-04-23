# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Greenfield scaffold. `src/index.ts` is empty — there is no application code yet, so there is no architecture to preserve. When adding code, set the initial structure thoughtfully rather than matching non-existent conventions.

## Toolchain

- **Node**: `v24.14.1` (see `.nvmrc`)
- **Package manager**: `pnpm@9.15.3` (pinned via `packageManager` in `package.json` — do not use npm/yarn)
- **Module system**: `"module": "Preserve"` + `"moduleResolution": "Bundler"` in `tsconfig.json`. `isolatedModules` is on, so every file must be independently transpilable (use `import type` for type-only imports).
- **Strictness**: `strict` + `noUncheckedIndexedAccess` are enabled — array/object index access yields `T | undefined` and must be narrowed.

## Commands

Defined in `package.json`:

- `pnpm types` — typecheck (`tsc --noEmit`)
- `pnpm test` — run Vitest once
- `pnpm test:watch` — Vitest watch mode

Run a single test file / test name:

```
pnpm test path/to/file.test.ts
pnpm test -t "test name substring"
```

`scripts/checks.sh` additionally calls `pnpm format:check`, `pnpm format`, and `pnpm lint`, but those scripts are **not defined in `package.json`**. Either add them (wrapping `prettier` / `eslint`) or invoke the binaries directly (`pnpm exec prettier --check .`, `pnpm exec eslint .`) until they are.

## Linting & formatting

- **ESLint**: flat config at `eslint.config.mjs` extends `eslint.configs.recommended` and `typescript-eslint.configs.recommendedTypeChecked`. `projectService: true` means ESLint needs the TS project graph — expect type-aware rules to fire.
- **Prettier**: config at `prettier.config.js` uses `@jackjakarta/prettier-config` with the `nodejs({ packageJson: true })` preset, which includes `prettier-plugin-packagejson` (so `package.json` gets auto-sorted on format) and an import-sort plugin.

## Testing

Vitest with `environment: "node"` and `passWithNoTests: true` (see `vitest.config.ts`). A passing test run on an empty suite is expected until real tests land.
