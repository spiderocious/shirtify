import type { Request } from 'express';

import { ValidationError } from '@lib/errors.js';

/** Read a required route param as a single string (Express types allow arrays). */
export const requireParam = (req: Request, name: string): string => {
  const raw = req.params[name];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== 'string' || value.length === 0) {
    throw new ValidationError(`Missing ${name}`, { [name]: ['required'] });
  }
  return value;
};
