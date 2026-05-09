import { z } from 'zod';

const voicedChord = z.object({
  chord: z.string().min(1).describe('Chord symbol for context.'),
  voicing: z
    .array(z.string().min(1))
    .min(1)
    .describe('Notes in scientific pitch notation (e.g. ["C4","E4","G4"]).'),
});

const warningSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('parallel-fifths'),
    voices: z.tuple([z.number().int(), z.number().int()]),
  }),
  z.object({
    type: z.literal('parallel-octaves'),
    voices: z.tuple([z.number().int(), z.number().int()]),
  }),
  z.object({
    type: z.literal('large-leap'),
    voice: z.number().int(),
    semitones: z.number().int(),
  }),
]);

export const inputSchema = z.object({
  from: voicedChord,
  to: voicedChord,
});

export const outputSchema = z.object({
  perVoice: z
    .array(
      z.object({
        from: z.string(),
        to: z.string(),
        semitones: z.number().int(),
        direction: z.enum(['up', 'down', 'static']),
      }),
    )
    .describe('Per-voice motion, paired by index.'),
  warnings: z
    .array(warningSchema)
    .describe('Voice-leading warnings: parallel 5ths/octaves and leaps > octave.'),
});

export type AnalyzeVoiceLeadingInput = z.infer<typeof inputSchema>;
export type AnalyzeVoiceLeadingOutput = z.infer<typeof outputSchema>;
