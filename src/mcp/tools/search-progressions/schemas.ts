import { z } from 'zod';

const progressionSummarySchema = z.object({
  slug: z.string(),
  name: z.string(),
  romanNumerals: z.array(z.string()),
  exampleKeys: z.array(z.string()),
  genres: z.array(z.string()),
  moods: z.array(z.string()),
  era: z.string().nullable(),
});

export const inputSchema = z.object({
  genre: z
    .string()
    .min(1)
    .optional()
    .describe('Match progressions whose genres array contains this value (e.g. "jazz", "blues").'),
  mood: z
    .string()
    .min(1)
    .optional()
    .describe('Match progressions whose moods array contains this value (e.g. "soulful").'),
  era: z
    .string()
    .min(1)
    .optional()
    .describe('Case-insensitive substring match on era (e.g. "20th century").'),
  romanContains: z
    .string()
    .min(1)
    .optional()
    .describe(
      'Match progressions whose romanNumerals array contains this exact Roman numeral (e.g. "V", "ii", "bVI").',
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe('Max results to return (default 50).'),
});

export const outputSchema = z.object({
  results: z.array(progressionSummarySchema).describe('Matching progressions, ordered by slug.'),
});

export type SearchProgressionsInput = z.infer<typeof inputSchema>;
export type SearchProgressionsOutput = z.infer<typeof outputSchema>;
