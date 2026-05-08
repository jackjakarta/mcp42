import { z } from 'zod';

export const inputSchema = z
  .object({
    subject: z
      .union([z.string().min(1), z.array(z.string().min(1)).min(1)])
      .describe(
        'A note ("C4"), a chord symbol ("Cmaj7"), or an array of chord symbols. Notes use scientific pitch (letter + accidentals + octave).',
      ),
    interval: z
      .string()
      .min(1)
      .optional()
      .describe('Interval like "P5", "M3", "-2M". Provide either `interval` or `targetKey`.'),
    targetKey: z
      .string()
      .min(1)
      .optional()
      .describe(
        'Target key tonic like "G", "Bb". The interval is computed from the subject\'s current tonic to this key.',
      ),
  })
  .refine((v) => (v.interval === undefined) !== (v.targetKey === undefined), {
    message: 'Provide exactly one of `interval` or `targetKey`.',
  });

export const outputSchema = z.object({
  kind: z.enum(['note', 'chord', 'chords']).describe('Detected subject kind.'),
  value: z
    .union([z.string(), z.array(z.string())])
    .describe('Transposed value, same shape as the input subject.'),
  interval: z.string().describe('The interval applied (resolved from `targetKey` if used).'),
});

export type TransposeToolInput = z.infer<typeof inputSchema>;
export type TransposeToolOutput = z.infer<typeof outputSchema>;
