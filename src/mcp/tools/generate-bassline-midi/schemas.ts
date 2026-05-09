import { z } from 'zod';

export const inputSchema = z.object({
  chords: z
    .array(z.string().min(1))
    .min(1)
    .describe('Chord symbols in order (e.g. ["Cmaj7","Am7","Dm7","G7"]).'),
  tempo: z.number().int().min(20).max(300).describe('Tempo in BPM.'),
  style: z
    .enum(['root', 'root-fifth', 'walking'])
    .describe(
      'Bass style. "walking" plays root–3rd–5th–chromatic-approach quarter notes; the approach targets the next chord on the last bar.',
    ),
  barsPerChord: z.number().int().min(1).max(16).describe('How many 4/4 bars each chord lasts.'),
});

export const outputSchema = z.object({
  midiBase64: z.string().describe('Base64-encoded Standard MIDI File bytes.'),
  format: z.literal('smf1').describe('SMF format type 1.'),
  ppq: z.literal(480).describe('Pulses per quarter note.'),
  durationMs: z.number().int().nonnegative().describe('Total duration in milliseconds.'),
  trackCount: z.number().int().positive().describe('Number of MIDI tracks.'),
});

export type GenerateBasslineMidiInput = z.infer<typeof inputSchema>;
export type GenerateBasslineMidiOutput = z.infer<typeof outputSchema>;
