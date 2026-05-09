import { z } from 'zod';

export const inputSchema = z.object({
  chords: z
    .array(z.string().min(1))
    .min(1)
    .describe('Chord symbols in order (e.g. ["Cmaj7","Am7","Dm7","G7"]).'),
  tempo: z.number().int().min(20).max(300).describe('Tempo in BPM.'),
  voicing: z
    .enum(['block', 'arpeggio-up', 'arpeggio-down', 'broken'])
    .describe('How chord tones are realized within each bar.'),
  barsPerChord: z.number().int().min(1).max(16).describe('How many 4/4 bars each chord lasts.'),
});

export const outputSchema = z.object({
  midiBase64: z.string().describe('Base64-encoded Standard MIDI File bytes.'),
  format: z.literal('smf1').describe('SMF format type 1.'),
  ppq: z.literal(480).describe('Pulses per quarter note.'),
  durationMs: z.number().int().nonnegative().describe('Total duration in milliseconds.'),
  trackCount: z.number().int().positive().describe('Number of MIDI tracks.'),
});

export type GenerateProgressionMidiInput = z.infer<typeof inputSchema>;
export type GenerateProgressionMidiOutput = z.infer<typeof outputSchema>;
