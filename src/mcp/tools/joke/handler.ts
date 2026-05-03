import { betterFetch } from '@better-fetch/fetch';
import { z } from 'zod';

import { type JokeCategory } from './schemas.js';

export async function getJokeHandler(category: JokeCategory) {
  const url = `https://api.chucknorris.io/jokes/random?category=${encodeURI(category)}`;
  const { data, error } = await betterFetch(url);

  if (error !== null) {
    console.error('[ERROR FETCH JOKE]', error);
    throw new Error('Error fetching joke');
  }

  const parsed = z
    .object({
      value: z.string().min(1),
    })
    .parse(data);

  return parsed.value;
}
