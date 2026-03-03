const DIGITS = 10;

function randomDigits(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (value) => (value % DIGITS).toString()).join("");
}

export function generateId(prefix: string): string {
  const timestamp = new Date()
    .toISOString()
    .replace(/\D/g, "")
    .slice(0, 14);
  return `${prefix}${timestamp}${randomDigits(4)}`;
}
