import { z } from 'zod';

export const inputSchema = z.object({
  key: z
    .string()
    .min(1)
    .describe('Key as "<tonic> <mode>" — e.g. "C major", "A minor", "F# minor".'),
});

export const outputSchema = z.object({
  chords: z
    .array(
      z.object({
        degree: z.number().int().describe('Scale degree, 1..7.'),
        roman: z.string().describe('Roman numeral (uppercase=major, lowercase=minor, °=dim).'),
        symbol: z.string().describe('Diatonic chord symbol.'),
        quality: z
          .string()
          .describe('Quality bucket: maj, min, dim, aug, dom7, maj7, min7, m7b5, or other.'),
      }),
    )
    .describe('Diatonic triads of the key, indexed by degree.'),
});

export type DiatonicChordsInput = z.infer<typeof inputSchema>;
export type DiatonicChordsOutput = z.infer<typeof outputSchema>;
