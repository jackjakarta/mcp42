import { z } from 'zod';

export const inputSchema = z.object({
  slug: z.string().min(1).describe('Unique slug of the mode (e.g. "ionian", "dorian", "lydian").'),
});

export const outputSchema = z.object({
  slug: z.string(),
  name: z.string(),
  parentScale: z.string(),
  intervals: z.array(z.string()),
  characteristicNotes: z.array(z.string()),
  mood: z.string().nullable(),
  commonGenres: z.array(z.string()),
});

export type GetModeInput = z.infer<typeof inputSchema>;
export type GetModeOutput = z.infer<typeof outputSchema>;
