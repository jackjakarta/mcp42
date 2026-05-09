import { z } from 'zod';

const voicingSchema = z.object({
  slug: z.string(),
  name: z.string(),
  chordQuality: z.string(),
  notesTemplate: z.array(z.string()),
  instrument: z.string().nullable(),
});

export const inputSchema = z.object({
  chordQuality: z
    .string()
    .min(1)
    .optional()
    .describe('Exact match on chord quality (e.g. "triad", "seventh", "any").'),
  instrument: z
    .string()
    .min(1)
    .optional()
    .describe('Exact match on instrument (e.g. "piano", "guitar").'),
});

export const outputSchema = z.object({
  results: z.array(voicingSchema).describe('Matching voicings, ordered by slug.'),
});

export type ListVoicingsInput = z.infer<typeof inputSchema>;
export type ListVoicingsOutput = z.infer<typeof outputSchema>;
