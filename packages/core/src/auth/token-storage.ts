// Simple synchronous token storage abstraction. Defaults to localStorage in
// the browser, no-op on the server (so SSR pages won't crash). Apps can
// inject their own implementation (e.g. cookie-based) by passing one to
// configureApiClient.

export const TOKEN_KEYS = {
  ACCESS: 'app.access_token',
  REFRESH: 'app.refresh_token',
} as const;

export type TokenKey = (typeof TOKEN_KEYS)[keyof typeof TOKEN_KEYS];

export interface TokenStorage {
  get(key: TokenKey): string | null;
  set(key: TokenKey, value: string): void;
  remove(key: TokenKey): void;
}

const noopStorage: TokenStorage = {
  get: () => null,
  set: () => undefined,
  remove: () => undefined,
};

// Minimal structural type so this file compiles without the DOM lib (core is
// also consumed by DOM-less Node backends). At runtime this resolves to the
// real localStorage in the browser.
interface WebStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const getLocalStorage = (): WebStorageLike | undefined => {
  const g = globalThis as { localStorage?: WebStorageLike };
  return g.localStorage;
};

export const createTokenStorage = (): TokenStorage => {
  const storage = getLocalStorage();
  if (!storage) return noopStorage;
  return {
    get: (key) => storage.getItem(key),
    set: (key, value) => storage.setItem(key, value),
    remove: (key) => storage.removeItem(key),
  };
};
