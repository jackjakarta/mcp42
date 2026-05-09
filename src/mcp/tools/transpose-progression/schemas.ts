import { z } from 'zod';

export const inputSchema = z
  .object({
    chords: z.array(z.string().min(1)).min(1).describe('Chord progression to transpose.'),
    interval: z
      .string()
      .min(1)
      .optional()
      .describe('Interval like "P5", "M3", "-2M". Provide either `interval` or `targetKey`.'),
    targetKey: z
      .string()
      .min(1)
      .optional()
      .describe('Target tonic like "G", "Bb". Computed relative to the first chord\'s root.'),
  })
  .refine((v) => (v.interval === undefined) !== (v.targetKey === undefined), {
    message: 'Provide exactly one of `interval` or `targetKey`.',
  });

export const outputSchema = z.object({
  chords: z.array(z.string()).describe('Transposed chord progression.'),
  interval: z.string().describe('The interval applied (resolved from `targetKey` if used).'),
});

export type TransposeProgressionInput = z.infer<typeof inputSchema>;
export type TransposeProgressionOutput = z.infer<typeof outputSchema>;
