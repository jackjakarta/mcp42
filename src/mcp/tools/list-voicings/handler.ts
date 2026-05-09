import { dbListVoicings } from '../../../db/functions/voicings.js';
import { type ListVoicingsInput, type ListVoicingsOutput } from './schemas.js';

export async function listVoicingsHandler(input: ListVoicingsInput): Promise<ListVoicingsOutput> {
  const voicings = await dbListVoicings(input);
  return {
    results: voicings.map((v) => ({
      slug: v.slug,
      name: v.name,
      chordQuality: v.chordQuality,
      notesTemplate: v.notesTemplate,
      instrument: v.instrument,
    })),
  };
}
