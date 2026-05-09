declare module 'midi-writer-js' {
  type NoteEventFields = {
    pitch: string | string[] | number | number[];
    duration?: string | number;
    wait?: string | number;
    velocity?: number;
    sequential?: boolean;
    repeat?: number;
    channel?: number;
    tick?: number;
    startTick?: number;
    grace?: string | string[];
  };

  class NoteEvent {
    constructor(fields: NoteEventFields);
  }

  class ProgramChangeEvent {
    constructor(fields: { instrument: number; channel?: number; delta?: number });
  }

  class Track {
    constructor();
    addEvent(event: NoteEvent | ProgramChangeEvent | (NoteEvent | ProgramChangeEvent)[]): Track;
    setTempo(bpm: number, tick?: number): Track;
    setTimeSignature(
      numerator: number,
      denominator: number,
      midiclockspertick?: number,
      notespermidiclock?: number,
    ): Track;
  }

  class Writer {
    constructor(tracks: Track | Track[], options?: { ticksPerBeat?: number; middleC?: string });
    buildFile(): Uint8Array;
    base64(): string;
    dataUri(): string;
  }

  const MidiWriter: {
    NoteEvent: typeof NoteEvent;
    ProgramChangeEvent: typeof ProgramChangeEvent;
    Track: typeof Track;
    Writer: typeof Writer;
  };

  export default MidiWriter;
  export { NoteEvent, ProgramChangeEvent, Track, Writer };
}
