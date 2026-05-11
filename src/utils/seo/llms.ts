export const LLMS_TXT_TEXT = `# mcpFortyTwo

> An MCP server for music-theory analysis and MIDI generation — spell chords, detect keys, suggest reharmonizations, and render basslines, drum patterns, scales, arpeggios and full progressions as Standard MIDI Files, all from any MCP-capable client.

mcpFortyTwo speaks the Model Context Protocol over Streamable HTTP at \`/mcp\`. A public instance runs at https://mcp42.jackjakarta.xyz/mcp. Every tool ships a Zod input/output schema and returns both a text rendering and a typed \`structuredContent\` payload, so clients get strongly-typed results without an extra parsing step.

## Docs

- [Overview](https://mcp42.jackjakarta.xyz/docs/): What mcpFortyTwo is and what it exposes.
- [Getting started](https://mcp42.jackjakarta.xyz/docs/getting-started/): Connect an MCP client to the hosted server, then call your first tool.
- [Configuration](https://mcp42.jackjakarta.xyz/docs/configuration/): Environment variables, Postgres, Docker and the build pipeline.
- [Tool reference](https://mcp42.jackjakarta.xyz/docs/tools/): Auto-generated reference for every registered MCP tool — inputs, outputs and annotations.

## Music theory tools

Atomic queries against [tonal](https://github.com/tonaljs/tonal): chords, scales, keys, modes, intervals, diatonic harmony, voice leading, Roman-numeral analysis, key detection, substitutions and transposition.

- [get-chord](https://mcp42.jackjakarta.xyz/docs/tools/get-chord/): Parse a chord symbol → root, quality, notes, intervals, extensions, bass.
- [get-scale](https://mcp42.jackjakarta.xyz/docs/tools/get-scale/): Spell a scale and its mode characteristics.
- [get-key](https://mcp42.jackjakarta.xyz/docs/tools/get-key/): Diatonic chords, signature and scale notes for a key.
- [get-mode](https://mcp42.jackjakarta.xyz/docs/tools/get-mode/): Detailed information about a single mode.
- [get-interval](https://mcp42.jackjakarta.xyz/docs/tools/get-interval/): Interval between two pitches with both shorthand and English names.
- [get-note-info](https://mcp42.jackjakarta.xyz/docs/tools/get-note-info/): Enharmonic, frequency, MIDI number and octave for a note.
- [get-diatonic-chords](https://mcp42.jackjakarta.xyz/docs/tools/get-diatonic-chords/): The seven diatonic chords for a key, with Roman-numeral functions.
- [get-progression](https://mcp42.jackjakarta.xyz/docs/tools/get-progression/): Expand a Roman-numeral progression in a key.
- [analyze-progression](https://mcp42.jackjakarta.xyz/docs/tools/analyze-progression/): Roman-numeral / functional analysis of a sequence of chords.
- [analyze-voice-leading](https://mcp42.jackjakarta.xyz/docs/tools/analyze-voice-leading/): Voice-leading distance, parallels and common-tone retention.
- [detect-key](https://mcp42.jackjakarta.xyz/docs/tools/detect-key/): Best-fit key for a list of chords or notes, with confidence.
- [transpose](https://mcp42.jackjakarta.xyz/docs/tools/transpose/): Transpose a single chord or note by an interval.
- [transpose-progression](https://mcp42.jackjakarta.xyz/docs/tools/transpose-progression/): Transpose an entire progression preserving voicings.
- [suggest-substitutions](https://mcp42.jackjakarta.xyz/docs/tools/suggest-substitutions/): Reharmonization candidates (tritone, secondary dominant, modal interchange…).

## Knowledge graph tools

Curated catalogue stored in Postgres, queried via Drizzle.

- [search-progressions](https://mcp42.jackjakarta.xyz/docs/tools/search-progressions/): Filter the progression catalogue by name, key, function or tag.
- [search-modes](https://mcp42.jackjakarta.xyz/docs/tools/search-modes/): Find modes by family, brightness or characteristic interval.
- [list-cadences](https://mcp42.jackjakarta.xyz/docs/tools/list-cadences/): Enumerate canonical cadences with their Roman-numeral patterns.
- [list-voicings](https://mcp42.jackjakarta.xyz/docs/tools/list-voicings/): Available voicings for the MIDI generators (closed, drop-2, shell, …).

## MIDI generation tools

Each generator returns a Standard MIDI File Type 1 (480 PPQ) as a base64 string plus metadata. Decode with \`base64 -d > out.mid\` and drop into any DAW.

- [generate-progression-midi](https://mcp42.jackjakarta.xyz/docs/tools/generate-progression-midi/): Chord progression with selectable voicing, tempo and time signature.
- [generate-scale-midi](https://mcp42.jackjakarta.xyz/docs/tools/generate-scale-midi/): A scale run across one or more octaves.
- [generate-arpeggio-midi](https://mcp42.jackjakarta.xyz/docs/tools/generate-arpeggio-midi/): Arpeggiated chord pattern (up, down, alternating, etc.).
- [generate-bassline-midi](https://mcp42.jackjakarta.xyz/docs/tools/generate-bassline-midi/): Bassline that follows a progression — root, walking, or pattern-based.
- [generate-drum-pattern-midi](https://mcp42.jackjakarta.xyz/docs/tools/generate-drum-pattern-midi/): Drum pattern on GM channel 10 (kick/snare/hat/etc.).

## Endpoints

- [https://mcp42.jackjakarta.xyz/mcp](https://mcp42.jackjakarta.xyz/mcp): MCP Streamable HTTP endpoint — stateless per-request, no session management required.
- [https://mcp42.jackjakarta.xyz/health](https://mcp42.jackjakarta.xyz/health): JSON liveness probe returning \`{ "ok": true }\`.
`;
