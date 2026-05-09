import { describe, expect, it } from 'vitest';

import { CADENCES } from './cadences.js';
import { MODES } from './modes.js';
import { PROGRESSIONS } from './progressions.js';
import { VOICINGS } from './voicings.js';

const SLUG_REGEX = /^[a-z0-9-]+$/;

function expectUniqueSlugs(rows: { slug: string }[]): void {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const row of rows) {
    if (seen.has(row.slug)) {
      duplicates.push(row.slug);
    }
    seen.add(row.slug);
  }
  expect(duplicates).toEqual([]);
}

describe('progressions seed data', () => {
  it('contains at least 30 entries (SPEC §8)', () => {
    expect(PROGRESSIONS.length).toBeGreaterThanOrEqual(30);
  });

  it('has unique, well-formed slugs', () => {
    expectUniqueSlugs(PROGRESSIONS);
    for (const p of PROGRESSIONS) {
      expect(p.slug).toMatch(SLUG_REGEX);
    }
  });

  it('has non-empty required text fields and arrays', () => {
    for (const p of PROGRESSIONS) {
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.description.length).toBeGreaterThan(0);
      expect(p.romanNumerals.length).toBeGreaterThan(0);
      expect(p.exampleKeys.length).toBeGreaterThan(0);
      expect(p.genres.length).toBeGreaterThan(0);
      expect(p.moods.length).toBeGreaterThan(0);
    }
  });

  it('spot-checks well-known progressions', () => {
    const bySlug = new Map(PROGRESSIONS.map((p) => [p.slug, p]));

    expect(bySlug.get('axis')?.romanNumerals).toEqual(['I', 'V', 'vi', 'IV']);
    expect(bySlug.get('doo-wop')?.romanNumerals).toEqual(['I', 'vi', 'IV', 'V']);
    expect(bySlug.get('ii-v-i-major')?.romanNumerals).toEqual(['ii', 'V', 'I']);
    expect(bySlug.get('plagal-amen')?.romanNumerals).toEqual(['IV', 'I']);
    expect(bySlug.get('twelve-bar-blues')?.romanNumerals).toHaveLength(12);
  });
});

describe('modes seed data', () => {
  it('contains the 7 diatonic modes plus harmonic/melodic minor and key derived modes', () => {
    expect(MODES.length).toBeGreaterThanOrEqual(14);
  });

  it('has unique, well-formed slugs', () => {
    expectUniqueSlugs(MODES);
    for (const m of MODES) {
      expect(m.slug).toMatch(SLUG_REGEX);
    }
  });

  it('every mode lists 7 intervals', () => {
    for (const m of MODES) {
      expect(m.intervals).toHaveLength(7);
      expect(m.intervals[0]).toBe('1P');
    }
  });

  it('has non-empty required fields', () => {
    for (const m of MODES) {
      expect(m.name.length).toBeGreaterThan(0);
      expect(m.parentScale.length).toBeGreaterThan(0);
      expect(m.characteristicNotes.length).toBeGreaterThan(0);
      expect(m.commonGenres.length).toBeGreaterThan(0);
    }
  });

  it('includes the 7 church modes', () => {
    const slugs = new Set(MODES.map((m) => m.slug));
    for (const expected of [
      'ionian',
      'dorian',
      'phrygian',
      'lydian',
      'mixolydian',
      'aeolian',
      'locrian',
    ]) {
      expect(slugs.has(expected)).toBe(true);
    }
  });
});

describe('voicings seed data', () => {
  it('contains at least 10 entries (SPEC §8)', () => {
    expect(VOICINGS.length).toBeGreaterThanOrEqual(10);
  });

  it('has unique, well-formed slugs', () => {
    expectUniqueSlugs(VOICINGS);
    for (const v of VOICINGS) {
      expect(v.slug).toMatch(SLUG_REGEX);
    }
  });

  it('has non-empty notesTemplate and chordQuality', () => {
    for (const v of VOICINGS) {
      expect(v.notesTemplate.length).toBeGreaterThan(0);
      expect(v.chordQuality.length).toBeGreaterThan(0);
      expect(v.name.length).toBeGreaterThan(0);
    }
  });

  it('includes the canonical jazz voicings', () => {
    const slugs = new Set(VOICINGS.map((v) => v.slug));
    for (const expected of ['drop-2', 'drop-3', 'shell-3-7', 'rootless-a', 'quartal-fourths']) {
      expect(slugs.has(expected)).toBe(true);
    }
  });
});

describe('cadences seed data', () => {
  it('covers the standard cadence types from SPEC §8', () => {
    const slugs = new Set(CADENCES.map((c) => c.slug));
    for (const expected of ['authentic', 'plagal', 'deceptive', 'half', 'phrygian']) {
      expect(slugs.has(expected)).toBe(true);
    }
  });

  it('has unique, well-formed slugs', () => {
    expectUniqueSlugs(CADENCES);
    for (const c of CADENCES) {
      expect(c.slug).toMatch(SLUG_REGEX);
    }
  });

  it('every cadence has a roman pattern and description', () => {
    for (const c of CADENCES) {
      expect(c.romanPattern.length).toBeGreaterThanOrEqual(2);
      expect(c.description.length).toBeGreaterThan(0);
      expect(c.name.length).toBeGreaterThan(0);
    }
  });
});
