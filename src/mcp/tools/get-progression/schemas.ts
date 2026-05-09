import { z } from 'zod';

export const inputSchema = z.object({
  slug: z
    .string()
    .min(1)
    .describe('Unique slug of the progression (e.g. "twelve-bar-blues", "ii-v-i-major").'),
});

export const outputSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  romanNumerals: z.array(z.string()),
  exampleKeys: z.array(z.string()),
  genres: z.array(z.string()),
  era: z.string().nullable(),
  moods: z.array(z.string()),
  attribution: z.string().nullable(),
});

export type GetProgressionInput = z.infer<typeof inputSchema>;
export type GetProgressionOutput = z.infer<typeof outputSchema>;
