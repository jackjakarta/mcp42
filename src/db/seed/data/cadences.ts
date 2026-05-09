import { type InsertCadenceModel } from '../../schema/music.js';

export const CADENCES: InsertCadenceModel[] = [
  {
    slug: 'authentic',
    name: 'Authentic cadence',
    romanPattern: ['V', 'I'],
    description:
      'Dominant resolves to tonic. The standard tonal close. "Imperfect authentic" if either chord is inverted; "perfect authentic" when both are root-position with the tonic in the soprano.',
  },
  {
    slug: 'perfect-authentic',
    name: 'Perfect authentic cadence',
    romanPattern: ['V', 'I'],
    description:
      'Authentic cadence with both chords in root position and the tonic note in the highest voice on the final chord. The strongest possible tonal closure.',
  },
  {
    slug: 'plagal',
    name: 'Plagal cadence',
    romanPattern: ['IV', 'I'],
    description:
      'Subdominant to tonic. Often called the "Amen cadence" because of its use at the end of hymns. Softer, less conclusive feel than the authentic cadence.',
  },
  {
    slug: 'deceptive',
    name: 'Deceptive cadence',
    romanPattern: ['V', 'vi'],
    description:
      'The dominant resolves to vi instead of I, frustrating the expected tonic arrival. Used to extend phrases or set up further harmonic motion.',
  },
  {
    slug: 'half',
    name: 'Half cadence',
    romanPattern: ['I', 'V'],
    description:
      'Phrase ends on the dominant rather than resolving to tonic. Creates a sense of pause and expectation. Any chord may precede the V; I-V and ii-V are typical.',
  },
  {
    slug: 'phrygian',
    name: 'Phrygian half cadence',
    romanPattern: ['iv6', 'V'],
    description:
      'In minor, iv in first inversion (with the b6 in the bass) resolving to V. The descending half-step b6→5 in the bass gives the cadence its characteristic Phrygian colour.',
  },
];
