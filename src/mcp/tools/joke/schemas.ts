import { z } from 'zod';

const categoriesSchema = z.enum([
  'animal',
  'career',
  'celebrity',
  'dev',
  'explicit',
  'fashion',
  'food',
  'history',
  'money',
  'movie',
  'music',
  'political',
  'religion',
  'science',
  'sport',
  'travel',
]);

export type JokeCategory = z.infer<typeof categoriesSchema>;

export const inputSchema = z.object({
  category: categoriesSchema.describe('Joke category'),
});

export const outputSchema = z.object({
  joke: z.string(),
});
