import { RegisterBody, LoginBody, RefreshBody } from '@shirtify/core';
import { Router, type IRouter } from 'express';

import { asyncHandler } from '@lib/http/asyncHandler.js';
import { ResponseUtil } from '@lib/response.js';
import { rateLimit } from '@middlewares/rateLimit.middleware.js';

import { registerSeller, loginSeller, refreshTokens } from './auth.service.js';

const router: IRouter = Router();

// Throttle credential endpoints against stuffing/abuse (per client IP).
const loginLimiter = rateLimit({ bucket: 'auth-login', max: 10, windowMs: 15 * 60_000 });
const registerLimiter = rateLimit({ bucket: 'auth-register', max: 20, windowMs: 60 * 60_000 });

router.post(
  '/register',
  registerLimiter,
  asyncHandler(async (req, res) => {
    const body = RegisterBody.parse(req.body);
    const result = await registerSeller(body);
    return ResponseUtil.created(res, result);
  }),
);

router.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const body = LoginBody.parse(req.body);
    const result = await loginSeller(body);
    return ResponseUtil.ok(res, result);
  }),
);

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const body = RefreshBody.parse(req.body);
    const result = await refreshTokens(body.refresh_token);
    return ResponseUtil.ok(res, result);
  }),
);

router.post(
  '/logout',
  asyncHandler(async (_req, res) => ResponseUtil.noContent(res)),
);

export default router;
