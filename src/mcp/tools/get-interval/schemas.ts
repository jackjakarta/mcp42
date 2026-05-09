import { z } from 'zod';

export const inputSchema = z.object({
  from: z.string().min(1).describe('Starting note (e.g. "C", "C4").'),
  to: z.string().min(1).describe('Ending note (e.g. "G", "G4").'),
});

export const outputSchema = z.object({
  name: z.string().describe('Interval name like "5P", "3M", "7m".'),
  semitones: z.number().int().describe('Distance in semitones (signed).'),
  quality: z.string().describe('Interval quality: "P", "M", "m", "d", "A", etc.'),
  number: z.number().int().describe('Interval number (1=unison, 5=fifth, etc.).'),
});

export type IntervalInput = z.infer<typeof inputSchema>;
export type IntervalOutput = z.infer<typeof outputSchema>;
