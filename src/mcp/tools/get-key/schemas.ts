import { z } from 'zod';

export const inputSchema = z.object({
  tonic: z.string().min(1).describe('Key tonic (e.g. "C", "F#", "Bb").'),
  mode: z.enum(['major', 'minor']).describe('Key mode.'),
});

export const outputSchema = z.object({
  signature: z
    .string()
    .describe('Key signature as accidentals (e.g. "###", "bb", "" for C major).'),
  scale: z.array(z.string()).describe('Notes of the key scale.'),
  diatonicChords: z
    .array(
      z.object({
        degree: z.number().int(),
        roman: z.string(),
        symbol: z.string(),
      }),
    )
    .describe('Diatonic triads with degree, Roman numeral, and chord symbol.'),
  primary: z.array(z.string()).describe('Primary triads I, IV, V (or i, iv, v in minor).'),
  secondaryDominants: z
    .array(z.string())
    .describe('Secondary dominants (V/x) for the diatonic degrees that have one.'),
});

export type KeyInput = z.infer<typeof inputSchema>;
export type KeyOutput = z.infer<typeof outputSchema>;
