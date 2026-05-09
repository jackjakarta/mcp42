import { z } from 'zod';

export const inputSchema = z.object({
  tonic: z.string().min(1).describe('Scale tonic (e.g. "C", "F#", "Bb").'),
  type: z.string().min(1).describe('Scale type (e.g. "major", "minor", "dorian").'),
  tempo: z.number().int().min(20).max(300).describe('Tempo in BPM.'),
  direction: z
    .enum(['up', 'down', 'both'])
    .describe('Sequence direction. "both" plays up then back down without repeating the apex.'),
  octaves: z.number().int().min(1).max(4).describe('How many octaves of the scale to render.'),
});

export const outputSchema = z.object({
  midiBase64: z.string().describe('Base64-encoded Standard MIDI File bytes.'),
  format: z.literal('smf1').describe('SMF format type 1.'),
  ppq: z.literal(480).describe('Pulses per quarter note.'),
  durationMs: z.number().int().nonnegative().describe('Total duration in milliseconds.'),
  trackCount: z.number().int().positive().describe('Number of MIDI tracks.'),
});

export type GenerateScaleMidiInput = z.infer<typeof inputSchema>;
export type GenerateScaleMidiOutput = z.infer<typeof outputSchema>;
