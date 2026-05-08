import { z } from 'zod';

export const inputSchema = z.object({
  symbol: z
    .string()
    .min(1)
    .describe('Chord symbol in pop/jazz notation (e.g. "Cmaj7", "F#m7b5", "Gsus4", "Am/C").'),
});

export const outputSchema = z.object({
  root: z.string().describe('Root pitch class.'),
  quality: z.string().describe('Chord quality (e.g. "Major", "Minor", "Augmented").'),
  notes: z.array(z.string()).describe('Pitch classes that make up the chord.'),
  intervals: z.array(z.string()).describe('Intervals from the root for each chord tone.'),
  extensions: z
    .array(z.string())
    .describe('Intervals at or above the 7th (extensions and tensions).'),
  bass: z
    .string()
    .optional()
    .describe('Bass note for slash chords (e.g. "C" in "Am/C"); omitted when same as root.'),
});

export type ChordInput = z.infer<typeof inputSchema>;
export type ChordOutput = z.infer<typeof outputSchema>;
