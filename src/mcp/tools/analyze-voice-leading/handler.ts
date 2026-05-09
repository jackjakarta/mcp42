import { analyzeVoiceLeading, MusicInputError } from '../../../music/index.js';
import { type AnalyzeVoiceLeadingOutput } from './schemas.js';

export function analyzeVoiceLeadingHandler(
  from: { chord: string; voicing: string[] },
  to: { chord: string; voicing: string[] },
): AnalyzeVoiceLeadingOutput {
  try {
    return analyzeVoiceLeading(from, to);
  } catch (err) {
    if (err instanceof MusicInputError) {
      throw new Error(err.message);
    }
    throw err;
  }
}
