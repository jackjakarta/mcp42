# SPEC — Music Theory / MIDI MCP Server

A build plan for extending this MCP server with music theory analysis, MIDI generation, and a queryable knowledge graph of common progressions, modes, voicings, and cadences. Implementation is phased over multiple sessions; each phase is independently shippable.

## 1. Goals & non-goals

**Goals**

- Expose music theory primitives (notes, intervals, scales, chords, keys) as MCP tools.
- Analyze chord progressions: detect key, label with Roman numerals, surface cadences and substitutions.
- Generate MIDI for progressions, scales, arpeggios, basslines, and drum patterns.
- Provide a Postgres-backed knowledge graph of famous progressions, modes, voicings, and cadences, queryable from MCP.
- Stay stateless per request (matches the existing transport model).

**Non-goals (v1)**

- Audio synthesis or rendering to WAV/MP3.
- Score rendering (MusicXML, LilyPond, MEI).
- Parsing or analyzing user-uploaded MIDI files.
- Per-user persistence or accounts.
- Real-time / streaming features.

## 2. Conventions

- **Chord symbols**: standard pop/jazz notation — `Cmaj7`, `Dm7`, `F#m7b5`, `Gsus4`, `B7b9`, `Am/C` (slash chords). Parsed via `tonal`.
- **Notes**: pitch class (`C`, `D#`, `Bb`) or scientific pitch notation (`C4`, `Eb5`). Default octave is `4` when omitted.
- **Roman numerals**: uppercase = major (`I`, `IV`, `V`), lowercase = minor (`ii`, `vi`), `°` = diminished, `+` = augmented, `/` = applied (`V/V`), `b` = borrowed (`bVI`).
- **MIDI return shape**: base64-encoded bytes in `structuredContent`, plus a short text description in `content`. Standard MIDI File Type 1, 480 PPQ. No temp files.
- **Validation**: every tool input/output is a Zod schema; reuse the joke tool's `inputSchema.shape` / `outputSchema.shape` pattern.

## 3. Architecture additions

- `src/music/` — domain wrappers around `tonal` so tool handlers stay thin and the underlying library stays swappable. Functions like `parseChordSymbol(s)`, `getScaleNotes(tonic, type)`, `keyDetails(tonic, mode)`, all returning normalized shapes.
- `src/music/midi/` — wrappers around `midi-writer-js`: `progressionToMidi`, `scaleToMidi`, `arpeggioToMidi`, `basslineToMidi`, `drumPatternToMidi`. Each returns `Uint8Array` + metadata; the tool layer base64-encodes.
- `src/db/schema/music.ts` — knowledge graph tables (see §8).
- `src/db/functions/{progressions,modes,voicings,cadences}.ts` — query helpers, mirroring `src/db/functions/example.ts`.
- `src/db/seed/music.ts` — idempotent seed script run via a new `pnpm db:seed` script.
- One subdirectory per tool under `src/mcp/tools/<name>/` (the joke trio: `index.ts`, `handler.ts`, `schemas.ts`), all wired through `registerAllTools` in `src/mcp/tools/index.ts`.

## 4. Dependencies to add

- `tonal` — theory primitives.
- `midi-writer-js` — MIDI file generation.

Both are pure JS, no native bindings, fit the alpine Docker target.

## 5. Phase 1 — Theory primitives

Foundation lookups, all stateless, all `tonal`-backed.

| Tool            | Input                                                             | Output                                                                    |
| --------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `get_note_info` | `note: string`                                                    | `{ name, pc, octave, midi, freq, accidentals }`                           |
| `get_interval`  | `from, to: string`                                                | `{ name, semitones, quality, number }`                                    |
| `get_scale`     | `tonic, type` (major, minor, dorian, …)                           | `{ notes[], intervals[], chords[], modeOf? }`                             |
| `get_chord`     | `symbol: string`                                                  | `{ root, quality, notes[], intervals[], extensions[], bass? }`            |
| `transpose`     | `subject` (note / chord / chord array), `interval` or `targetKey` | transposed value of same shape                                            |
| `get_key`       | `tonic, mode`                                                     | `{ signature, scale[], diatonicChords[], primary, secondaryDominants[] }` |

**Acceptance**: all six callable from an MCP client; each handler validates input via Zod and returns both `content` text + `structuredContent`.

## 6. Phase 2 — Progression analysis

Builds on §5 wrappers.

| Tool                    | Input                                      | Output                                                                      |
| ----------------------- | ------------------------------------------ | --------------------------------------------------------------------------- |
| `analyze_progression`   | `chords: string[]`, `keyHint?: string`     | `{ key, romanNumerals[], cadences[], modulations[] }`                       |
| `detect_key`            | `chords: string[]` _or_ `notes: string[]`  | `{ candidates: [{ key, score }] }` ranked                                   |
| `transpose_progression` | `chords[]`, `interval` or `targetKey`      | `{ chords[] }`                                                              |
| `get_diatonic_chords`   | `key`                                      | `{ chords: [{ degree, roman, symbol, quality }] }`                          |
| `suggest_substitutions` | `chord, key`                               | `{ tritoneSub?, secondaryDominant?, borrowedChords[], modalInterchange[] }` |
| `analyze_voice_leading` | `from: chord+voicing`, `to: chord+voicing` | `{ perVoice[], warnings[] }` (parallel 5ths/octaves, leap > octave)         |

**Acceptance**: feed it a 12-bar blues and a ii-V-I; output Roman numerals match expected analysis.

## 7. Phase 3 — MIDI generation

All tools return `{ midiBase64, format: "smf1", ppq: 480, durationMs, trackCount }`.

- `generate_progression_midi` — `chords[]`, `tempo`, `voicing` (`block` | `arpeggio-up` | `arpeggio-down` | `broken`), `barsPerChord`.
- `generate_scale_midi` — `scale` (tonic + type), `tempo`, `direction` (`up` | `down` | `both`), `octaves`.
- `generate_arpeggio_midi` — `chord`, `tempo`, `pattern` (`up` | `down` | `alternating` | `random`), `bars`.
- `generate_bassline_midi` — `chords[]`, `tempo`, `style` (`root` | `root-fifth` | `walking`), `barsPerChord`.
- `generate_drum_pattern_midi` — `pattern` (`rock-basic` | `swing` | `latin-bossa` | `funk-16th`), `tempo`, `bars`. GM drum map, channel 10.

**Acceptance**: returned base64 decodes to a valid SMF that opens in any DAW; tempo and note count match inputs.

## 8. Phase 4a — Knowledge graph schema + seed

New Postgres schema `music` (separate from `app`) with Drizzle tables:

- **`progressions`** — `id uuid pk`, `slug text unique`, `name text`, `description text`, `roman_numerals text[]`, `example_keys text[]`, `genres text[]`, `era text`, `moods text[]`, `attribution text`, `created_at`, `updated_at`.
- **`modes`** — `id`, `slug unique`, `name`, `parent_scale`, `intervals text[]`, `characteristic_notes text[]`, `mood text`, `common_genres text[]`.
- **`voicings`** — `id`, `slug unique`, `chord_quality text`, `name text` (drop2, shell, rootless, …), `notes_template text[]`, `instrument text`.
- **`cadences`** — `id`, `slug unique`, `name`, `roman_pattern text[]`, `description`.

Seed (`src/db/seed/music.ts`, idempotent via `ON CONFLICT DO UPDATE` keyed on `slug`):

- ~30 progressions: 12-bar blues, rhythm changes A/B, ii-V-I (major/minor), I-V-vi-IV (axis), I-vi-IV-V (doo-wop), Pachelbel, andalusian cadence, Coltrane changes, Hirajōshi loop, plagal, deceptive, etc.
- 7 diatonic modes + harmonic/melodic minor and their modes.
- ~10 voicings (drop-2, drop-3, shell, rootless A/B, quartal, …).
- Standard cadences (authentic, plagal, deceptive, half, phrygian).

Wire `pnpm db:seed` → `tsx src/db/seed/music.ts` in `package.json`.

## 9. Phase 4b — Knowledge graph tools

| Tool                  | Input                                             | Output                              |
| --------------------- | ------------------------------------------------- | ----------------------------------- |
| `search_progressions` | `{ genre?, mood?, era?, romanContains?, limit? }` | `{ results: ProgressionSummary[] }` |
| `get_progression`     | `slug`                                            | full progression record             |
| `search_modes`        | `{ mood?, genre?, parentScale? }`                 | `{ results: ModeSummary[] }`        |
| `get_mode`            | `slug`                                            | full mode record                    |
| `list_voicings`       | `{ chordQuality?, instrument? }`                  | `{ results: Voicing[] }`            |
| `list_cadences`       | `{}`                                              | `{ results: Cadence[] }`            |

All read-only; mark `readOnlyHint: true, idempotentHint: true` like the joke tool.

## 10. Session roadmap

1. **Session A** — add deps, scaffold `src/music/`, ship Phase 1 tools (§5).
2. **Session B** — Phase 2 progression analysis (§6).
3. **Session C** — Phase 3 MIDI generation (§7).
4. **Session D** — Phase 4a: schema migration + seed script (§8).
5. **Session E** — Phase 4b: KG query tools (§9).

Each session ends green: `pnpm format:check && pnpm lint && pnpm types && pnpm test` (the gates from `scripts/checks.sh`).

## 11. Verification

- After each session, register the new tools and exercise them from an MCP client pointed at `http://localhost:3000/mcp` (the `.mcp.json` already wires this up).
- Add unit tests under `src/music/**/*.test.ts` for the wrapper layer (Vitest, `environment: node`); skip integration tests against the DB until Phase 4a ships migrations.
- For MIDI: write the base64 output to a tmp `.mid` and open it in a DAW once per phase to confirm musical correctness.
