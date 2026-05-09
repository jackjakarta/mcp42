export class MusicInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MusicInputError';
  }
}
