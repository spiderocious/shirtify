import { RegisterBody, LoginBody, RefreshBody } from '@shirtify/core';
import { Router, type IRouter } from 'express';

import { asyncHandler } from '@lib/http/asyncHandler.js';
import { ResponseUtil } from '@lib/response.js';

import { registerSeller, loginSeller, refreshTokens } from './auth.service.js';

const router: IRouter = Router();

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const body = RegisterBody.parse(req.body);
    const result = await registerSeller(body);
    return ResponseUtil.created(res, result);
  }),
);

router.post(
  '/login',
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
