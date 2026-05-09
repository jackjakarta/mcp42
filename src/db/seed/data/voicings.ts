import { type InsertVoicingModel } from '../../schema/music.js';

export const VOICINGS: InsertVoicingModel[] = [
  {
    slug: 'close-position-triad',
    chordQuality: 'triad',
    name: 'Close-position triad',
    notesTemplate: ['R', '3', '5'],
    instrument: null,
  },
  {
    slug: 'spread-triad',
    chordQuality: 'triad',
    name: 'Spread triad',
    notesTemplate: ['R', '5', '3'],
    instrument: 'piano',
  },
  {
    slug: 'shell-3-7',
    chordQuality: 'seventh',
    name: 'Shell voicing (3 over 7)',
    notesTemplate: ['3', '7'],
    instrument: 'piano',
  },
  {
    slug: 'shell-7-3',
    chordQuality: 'seventh',
    name: 'Shell voicing (7 over 3)',
    notesTemplate: ['7', '3'],
    instrument: 'piano',
  },
  {
    slug: 'drop-2',
    chordQuality: 'seventh',
    name: 'Drop-2 voicing',
    notesTemplate: ['5', 'R', '3', '7'],
    instrument: 'guitar',
  },
  {
    slug: 'drop-3',
    chordQuality: 'seventh',
    name: 'Drop-3 voicing',
    notesTemplate: ['3', 'R', '5', '7'],
    instrument: 'guitar',
  },
  {
    slug: 'drop-2-and-4',
    chordQuality: 'seventh',
    name: 'Drop-2-and-4 voicing',
    notesTemplate: ['5', '7', 'R', '3'],
    instrument: 'guitar',
  },
  {
    slug: 'rootless-a',
    chordQuality: 'seventh',
    name: 'Rootless A (Bill Evans)',
    notesTemplate: ['3', '5', '7', '9'],
    instrument: 'piano',
  },
  {
    slug: 'rootless-b',
    chordQuality: 'seventh',
    name: 'Rootless B (Bill Evans)',
    notesTemplate: ['7', '9', '3', '5'],
    instrument: 'piano',
  },
  {
    slug: 'quartal-fourths',
    chordQuality: 'any',
    name: 'Quartal voicing (stacked fourths)',
    notesTemplate: ['R', '4', '7', '3'],
    instrument: 'piano',
  },
];
