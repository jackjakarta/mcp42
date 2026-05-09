export function decodeBase64(s: string): Uint8Array {
  return new Uint8Array(Buffer.from(s, 'base64'));
}

export function smfMagic(bytes: Uint8Array): string {
  return String.fromCharCode(bytes[0] ?? 0, bytes[1] ?? 0, bytes[2] ?? 0, bytes[3] ?? 0);
}

export function containsByte(bytes: Uint8Array, target: number): boolean {
  return bytes.includes(target);
}
