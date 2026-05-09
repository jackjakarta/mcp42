import { z } from 'zod';

export const inputSchema = z.object({
  pattern: z
    .enum(['rock-basic', 'swing', 'latin-bossa', 'funk-16th'])
    .describe('Pre-built drum groove (GM drum map, channel 10).'),
  tempo: z.number().int().min(20).max(300).describe('Tempo in BPM.'),
  bars: z.number().int().min(1).max(64).describe('Number of 4/4 bars to repeat the pattern over.'),
});

export const outputSchema = z.object({
  midiBase64: z.string().describe('Base64-encoded Standard MIDI File bytes.'),
  format: z.literal('smf1').describe('SMF format type 1.'),
  ppq: z.literal(480).describe('Pulses per quarter note.'),
  durationMs: z.number().int().nonnegative().describe('Total duration in milliseconds.'),
  trackCount: z.number().int().positive().describe('Number of MIDI tracks.'),
});

export type GenerateDrumPatternMidiInput = z.infer<typeof inputSchema>;
export type GenerateDrumPatternMidiOutput = z.infer<typeof outputSchema>;
