import { createTokenStorage, TOKEN_KEYS, type TokenPair } from '@shirtify/core';

// The same storage the @shirtify/api ky client reads from — so writing tokens
// here makes every subsequent request authenticated.
const storage = createTokenStorage();

export const storeTokens = (tokens: TokenPair): void => {
  storage.set(TOKEN_KEYS.ACCESS, tokens.access_token);
  storage.set(TOKEN_KEYS.REFRESH, tokens.refresh_token);
};

export const clearTokens = (): void => {
  storage.remove(TOKEN_KEYS.ACCESS);
  storage.remove(TOKEN_KEYS.REFRESH);
};

export const hasAccessToken = (): boolean => storage.get(TOKEN_KEYS.ACCESS) !== null;
