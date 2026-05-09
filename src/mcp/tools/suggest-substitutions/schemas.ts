import { z } from 'zod';

export const inputSchema = z.object({
  chord: z.string().min(1).describe('Chord symbol to suggest substitutions for.'),
  key: z.string().min(1).describe('Key as "<tonic> <mode>" — e.g. "C major", "A minor".'),
});

export const outputSchema = z.object({
  tritoneSub: z
    .object({ symbol: z.string(), roman: z.string() })
    .optional()
    .describe('Tritone substitution (only present for dominant-7 chords).'),
  secondaryDominant: z
    .object({ symbol: z.string(), roman: z.string() })
    .optional()
    .describe("Secondary dominant of the input chord (omitted when chord is the key's tonic)."),
  borrowedChords: z
    .array(
      z.object({
        symbol: z.string(),
        roman: z.string(),
        sourceMode: z.enum(['parallel-minor', 'parallel-major']),
      }),
    )
    .describe('Chords borrowed from the parallel mode and not already diatonic.'),
  modalInterchange: z
    .array(
      z.object({
        symbol: z.string(),
        roman: z.string(),
        sourceMode: z.enum(['dorian', 'mixolydian', 'phrygian']),
      }),
    )
    .describe('Characteristic chords from parallel Dorian, Mixolydian, and Phrygian modes.'),
});

export type SuggestSubstitutionsInput = z.infer<typeof inputSchema>;
export type SuggestSubstitutionsOutput = z.infer<typeof outputSchema>;
