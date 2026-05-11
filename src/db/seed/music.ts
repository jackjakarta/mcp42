import { sql } from 'drizzle-orm';

import { db } from '../index.js';
import { cadencesTable, modesTable, progressionsTable, voicingsTable } from '../schema/music.js';
import { CADENCES } from './data/cadences.js';
import { MODES } from './data/modes.js';
import { PROGRESSIONS } from './data/progressions.js';
import { VOICINGS } from './data/voicings.js';

async function seedProgressions(): Promise<number> {
  await db
    .insert(progressionsTable)
    .values(PROGRESSIONS)
    .onConflictDoUpdate({
      target: progressionsTable.slug,
      set: {
        name: sql`excluded.name`,
        description: sql`excluded.description`,
        romanNumerals: sql`excluded.roman_numerals`,
        exampleKeys: sql`excluded.example_keys`,
        genres: sql`excluded.genres`,
        era: sql`excluded.era`,
        moods: sql`excluded.moods`,
        attribution: sql`excluded.attribution`,
        updatedAt: new Date(),
      },
    });
  return PROGRESSIONS.length;
}

async function seedModes(): Promise<number> {
  await db
    .insert(modesTable)
    .values(MODES)
    .onConflictDoUpdate({
      target: modesTable.slug,
      set: {
        name: sql`excluded.name`,
        parentScale: sql`excluded.parent_scale`,
        intervals: sql`excluded.intervals`,
        characteristicNotes: sql`excluded.characteristic_notes`,
        mood: sql`excluded.mood`,
        commonGenres: sql`excluded.common_genres`,
      },
    });
  return MODES.length;
}

async function seedVoicings(): Promise<number> {
  await db
    .insert(voicingsTable)
    .values(VOICINGS)
    .onConflictDoUpdate({
      target: voicingsTable.slug,
      set: {
        chordQuality: sql`excluded.chord_quality`,
        name: sql`excluded.name`,
        notesTemplate: sql`excluded.notes_template`,
        instrument: sql`excluded.instrument`,
      },
    });
  return VOICINGS.length;
}

async function seedCadences(): Promise<number> {
  await db
    .insert(cadencesTable)
    .values(CADENCES)
    .onConflictDoUpdate({
      target: cadencesTable.slug,
      set: {
        name: sql`excluded.name`,
        romanPattern: sql`excluded.roman_pattern`,
        description: sql`excluded.description`,
      },
    });
  return CADENCES.length;
}

async function main(): Promise<void> {
  const progressions = await seedProgressions();
  console.log(`  music_progressions  upserted ${progressions} rows`);

  const modes = await seedModes();
  console.log(`  music_modes         upserted ${modes} rows`);

  const voicings = await seedVoicings();
  console.log(`  music_voicings      upserted ${voicings} rows`);

  const cadences = await seedCadences();
  console.log(`  music_cadences      upserted ${cadences} rows`);
}

main()
  .then(() => {
    console.log('seed complete');
    process.exit(0);
  })
  .catch((err: unknown) => {
    console.error('seed failed:', err);
    process.exit(1);
  });
