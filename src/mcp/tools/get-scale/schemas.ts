import { z } from 'zod';

export const inputSchema = z.object({
  tonic: z.string().min(1).describe('Scale tonic pitch class (e.g. "C", "F#", "Bb").'),
  type: z
    .string()
    .min(1)
    .describe('Scale type (e.g. "major", "minor", "dorian", "lydian", "harmonic minor").'),
});

export const outputSchema = z.object({
  notes: z.array(z.string()).describe('Notes of the scale, in order.'),
  intervals: z.array(z.string()).describe('Intervals from tonic for each scale degree.'),
  chords: z.array(z.string()).describe('Chord types that fit the scale (without tonic).'),
  modeOf: z
    .string()
    .optional()
    .describe('If the scale is a diatonic mode, the parent major scale (e.g. "C major").'),
});

export type ScaleInput = z.infer<typeof inputSchema>;
export type ScaleOutput = z.infer<typeof outputSchema>;
