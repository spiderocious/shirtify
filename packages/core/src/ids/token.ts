/**
 * Per-session link token: unguessable but readable and shareable.
 * 8 chars of base62 (PRD §10) — ~218 trillion combinations.
 *
 * Uses Web Crypto (`crypto.getRandomValues`), available in Node ≥ 20 and all
 * target browsers, so this stays in the pure-TS `@shirtify/core` package.
 */
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const generateToken = (length = 8): string => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < length; i++) {
    // bytes[i] is 0..255; modulo 62 has negligible bias for an unguessable id.
    out += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return out;
};

/** Lowercase, hyphenated, URL-safe slug from a business name. */
export const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'shop';
