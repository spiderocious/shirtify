import type { Request, Response, NextFunction } from 'express';

import { verifyAccessToken } from '@lib/auth/jwt.js';
import { UnauthorizedError } from '@lib/errors.js';
import { requestContext } from '@lib/http/requestContext.js';

/**
 * Requires a valid seller access token. On success, seeds the request context
 * with `userId` + `role` so services read identity from context — never `req`
 * (hard-lessons: HTTP must not leak into the service layer).
 */
export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing bearer token');
  }
  const token = header.slice('Bearer '.length).trim();
  try {
    const claims = verifyAccessToken(token);
    requestContext.set('userId', claims.sub);
    requestContext.set('role', claims.role);
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
};

/** Reads the authenticated seller id from context (after requireAuth). */
export const currentSellerId = (): string => {
  const id = requestContext.get()?.userId;
  if (!id) throw new UnauthorizedError('Not authenticated');
  return id;
};
