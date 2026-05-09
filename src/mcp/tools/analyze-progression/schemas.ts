import { z } from 'zod';

const cadenceTypeSchema = z.enum([
  'authentic',
  'perfect-authentic',
  'plagal',
  'half',
  'deceptive',
  'phrygian',
]);

export const inputSchema = z.object({
  chords: z
    .array(z.string().min(1))
    .min(1)
    .describe('Chord symbols in order, e.g. ["Dm7","G7","Cmaj7"].'),
  keyHint: z
    .string()
    .min(1)
    .optional()
    .describe('Optional key hint like "C major" or "A minor". When omitted, the key is inferred.'),
});

export const outputSchema = z.object({
  key: z.string().describe('Detected (or hinted) key, e.g. "C major".'),
  romanNumerals: z.array(z.string()).describe('Roman numeral label per chord, in order.'),
  cadences: z
    .array(
      z.object({
        type: cadenceTypeSchema,
        index: z.number().int().describe('Index of the resolving (second) chord.'),
        chords: z.tuple([z.string(), z.string()]),
        romans: z.tuple([z.string(), z.string()]),
      }),
    )
    .describe('Detected cadences, each at the index of the resolving chord.'),
  modulations: z
    .array(
      z.object({
        fromIndex: z.number().int(),
        toIndex: z.number().int(),
        fromKey: z.string(),
        toKey: z.string(),
        pivot: z.string().optional(),
      }),
    )
    .describe('Detected key changes (empty in v1; reserved for a later phase).'),
});

export type AnalyzeProgressionInput = z.infer<typeof inputSchema>;
export type AnalyzeProgressionOutput = z.infer<typeof outputSchema>;
