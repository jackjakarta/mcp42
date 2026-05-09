import { z } from 'zod';

const cadenceSchema = z.object({
  slug: z.string(),
  name: z.string(),
  romanPattern: z.array(z.string()),
  description: z.string(),
});

export const inputSchema = z.object({});

export const outputSchema = z.object({
  results: z.array(cadenceSchema).describe('All cadences, ordered by slug.'),
});

export type ListCadencesInput = z.infer<typeof inputSchema>;
export type ListCadencesOutput = z.infer<typeof outputSchema>;
