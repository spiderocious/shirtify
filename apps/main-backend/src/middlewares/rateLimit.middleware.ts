import type { Request, Response, NextFunction } from 'express';

import { AppError } from '@lib/errors.js';

/**
 * Minimal in-memory sliding-window rate limiter. Sufficient for MVP abuse
 * defence (e.g. credential stuffing on /auth/login). For multi-instance
 * production, swap the store for Redis behind the same middleware shape.
 *
 * Keyed by client IP + a route bucket. Emits 429 `rate_limited` with Retry-After.
 */
interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

/** Test-only: clear all rate-limit buckets between tests. */
export const __resetRateLimit = (): void => store.clear();

// Periodic cleanup so the map doesn't grow unbounded.
const SWEEP_MS = 60_000;
let lastSweep = 0;
const sweep = (now: number): void => {
  if (now - lastSweep < SWEEP_MS) return;
  lastSweep = now;
  for (const [key, b] of store) {
    if (b.resetAt <= now) store.delete(key);
  }
};

export interface RateLimitOptions {
  /** Bucket name (keeps routes independent). */
  bucket: string;
  /** Max requests per window. */
  max: number;
  /** Window length in ms. */
  windowMs: number;
}

export const rateLimit = ({ bucket, max, windowMs }: RateLimitOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    sweep(now);

    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const key = `${bucket}:${ip}`;
    const existing = store.get(key);

    if (!existing || existing.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (existing.count >= max) {
      const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      throw new AppError('rate_limited', 'Too many requests, please try again later', 429, undefined, retryAfter);
    }

    existing.count += 1;
    next();
  };
};
