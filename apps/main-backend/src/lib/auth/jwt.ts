import jwt, { type SignOptions } from 'jsonwebtoken';

import { env } from '../../env.js';

export interface AccessClaims {
  sub: string; // seller id
  role: string;
}

export interface RefreshClaims {
  sub: string;
  type: 'refresh';
}

export const signAccessToken = (sellerId: string, role: string): string =>
  jwt.sign({ sub: sellerId, role } satisfies AccessClaims, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as SignOptions);

export const signRefreshToken = (sellerId: string): string =>
  jwt.sign({ sub: sellerId, type: 'refresh' } satisfies RefreshClaims, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);

export const verifyAccessToken = (token: string): AccessClaims => {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  if (typeof decoded === 'string' || !('sub' in decoded) || !('role' in decoded)) {
    throw new Error('malformed access token');
  }
  return { sub: String(decoded.sub), role: String(decoded.role) };
};

export const verifyRefreshToken = (token: string): RefreshClaims => {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  if (typeof decoded === 'string' || decoded.type !== 'refresh' || !('sub' in decoded)) {
    throw new Error('malformed refresh token');
  }
  return { sub: String(decoded.sub), type: 'refresh' };
};
