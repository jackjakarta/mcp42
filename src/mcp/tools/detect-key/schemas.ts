import { z } from 'zod';

export const inputSchema = z
  .object({
    chords: z
      .array(z.string().min(1))
      .min(1)
      .optional()
      .describe('Chord symbols. Provide either `chords` or `notes`, not both.'),
    notes: z
      .array(z.string().min(1))
      .min(1)
      .optional()
      .describe('Pitch classes or scientific-pitch notes. Provide either `chords` or `notes`.'),
  })
  .refine((v) => (v.chords === undefined) !== (v.notes === undefined), {
    message: 'Provide exactly one of `chords` or `notes`.',
  });

export const outputSchema = z.object({
  candidates: z
    .array(
      z.object({
        key: z.string().describe('Key name, e.g. "C major" or "A minor".'),
        score: z.number().describe('Higher score = better fit. Normalized by input length.'),
      }),
    )
    .describe('Top 5 ranked key candidates.'),
});

export type DetectKeyInput = z.infer<typeof inputSchema>;
export type DetectKeyOutput = z.infer<typeof outputSchema>;
