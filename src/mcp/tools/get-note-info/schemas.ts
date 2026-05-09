import { z } from 'zod';

export const inputSchema = z.object({
  note: z
    .string()
    .min(1)
    .describe(
      'A pitch class (e.g. "C", "F#", "Bb") or scientific pitch (e.g. "C4", "Eb5"). Octave defaults to 4 when omitted.',
    ),
});

export const outputSchema = z.object({
  name: z.string().describe('Canonical note name including octave.'),
  pc: z.string().describe('Pitch class without octave.'),
  octave: z.number().int().describe('Octave number.'),
  midi: z.number().int().describe('MIDI note number (0-127 typical).'),
  freq: z.number().describe('Frequency in Hz at A4=440.'),
  accidentals: z
    .string()
    .describe('Accidental symbols ("#", "b", "##", "bb", or "" for naturals).'),
});

export type NoteInfoInput = z.infer<typeof inputSchema>;
export type NoteInfoOutput = z.infer<typeof outputSchema>;
