import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

import { AppError } from '@lib/errors.js';
import { requestContext } from '@lib/http/requestContext.js';
import { logger } from '@lib/logger.js';
import { ResponseUtil } from '@lib/response.js';
import { HTTP_STATUS } from '@shared/constants/http-status.js';

interface BodyParserError {
  type: string;
  status?: number;
}

/** body-parser/express.json errors carry a string `type` and a `body` field. */
const isBodyParserError = (err: unknown): err is BodyParserError =>
  err instanceof SyntaxError &&
  'type' in err &&
  typeof (err as { type: unknown }).type === 'string' &&
  (err as { type: string }).type.startsWith('entity.');

const formatZodFieldErrors = (err: ZodError): Record<string, string[]> => {
  const out: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const key = issue.path.join('.') || '_root';
    const arr = (out[key] ??= []);
    arr.push(issue.message);
  }
  return out;
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const requestId = requestContext.getRequestId();

  if (err instanceof AppError) {
    if (err.status >= 500) {
      logger.error({ err, requestId }, err.message);
    }
    if (err.retryAfter !== undefined) {
      res.setHeader('Retry-After', err.retryAfter);
    }
    ResponseUtil.error(res, err.status, {
      code: err.code,
      message: err.message,
      ...(err.fieldErrors !== undefined ? { field_errors: err.fieldErrors } : {}),
    });
    return;
  }

  if (err instanceof ZodError) {
    ResponseUtil.error(res, HTTP_STATUS.BAD_REQUEST, {
      code: 'validation_error',
      message: 'Validation failed',
      field_errors: formatZodFieldErrors(err),
    });
    return;
  }

  // body-parser (express.json) errors are client faults, not 500s:
  //  - malformed JSON → SyntaxError with type 'entity.parse.failed'
  //  - oversized body  → type 'entity.too.large' (status 413)
  if (isBodyParserError(err)) {
    if (err.type === 'entity.too.large') {
      ResponseUtil.error(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, {
        code: 'validation_error',
        message: 'Request body is too large',
      });
      return;
    }
    ResponseUtil.error(res, HTTP_STATUS.BAD_REQUEST, {
      code: 'validation_error',
      message: 'Malformed request body',
    });
    return;
  }

  logger.error({ err, requestId }, 'Unhandled error');
  ResponseUtil.error(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, {
    code: 'internal',
    message: 'An unexpected error occurred',
  });
};
