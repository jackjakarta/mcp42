import { z } from 'zod';

export const inputSchema = z.object({
  chord: z.string().min(1).describe('Chord symbol (e.g. "Cmaj7", "F#m7b5").'),
  tempo: z.number().int().min(20).max(300).describe('Tempo in BPM.'),
  pattern: z
    .enum(['up', 'down', 'alternating', 'random'])
    .describe('Arpeggio direction. "random" is seeded by the input so it is reproducible.'),
  bars: z
    .number()
    .int()
    .min(1)
    .max(32)
    .describe('Number of 4/4 bars (16 sixteenth notes per bar).'),
});

export const outputSchema = z.object({
  midiBase64: z.string().describe('Base64-encoded Standard MIDI File bytes.'),
  format: z.literal('smf1').describe('SMF format type 1.'),
  ppq: z.literal(480).describe('Pulses per quarter note.'),
  durationMs: z.number().int().nonnegative().describe('Total duration in milliseconds.'),
  trackCount: z.number().int().positive().describe('Number of MIDI tracks.'),
});

export type GenerateArpeggioMidiInput = z.infer<typeof inputSchema>;
export type GenerateArpeggioMidiOutput = z.infer<typeof outputSchema>;
