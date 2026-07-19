const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomSegment(length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return result;
}

export function generateActivationKey(): string {
  return `PV-${randomSegment(5)}-${randomSegment(5)}-${randomSegment(5)}`;
}
