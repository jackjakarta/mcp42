import { z } from 'zod';

const modeSummarySchema = z.object({
  slug: z.string(),
  name: z.string(),
  parentScale: z.string(),
  mood: z.string().nullable(),
  commonGenres: z.array(z.string()),
});

export const inputSchema = z.object({
  mood: z
    .string()
    .min(1)
    .optional()
    .describe("Case-insensitive substring match on the mode's mood description."),
  genre: z
    .string()
    .min(1)
    .optional()
    .describe('Match modes whose commonGenres array contains this value (e.g. "jazz", "metal").'),
  parentScale: z
    .string()
    .min(1)
    .optional()
    .describe('Exact match on parent scale (e.g. "major", "harmonic minor", "melodic minor").'),
});

export const outputSchema = z.object({
  results: z.array(modeSummarySchema).describe('Matching modes, ordered by slug.'),
});

export type SearchModesInput = z.infer<typeof inputSchema>;
export type SearchModesOutput = z.infer<typeof outputSchema>;
