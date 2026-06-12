import { Router, type IRouter } from 'express';

import { asyncHandler } from '@lib/http/asyncHandler.js';
import { ResponseUtil } from '@lib/response.js';
import { requireAuth, currentSellerId } from '@middlewares/auth.middleware.js';

import { getSellerById } from './auth.service.js';

const router: IRouter = Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const seller = await getSellerById(currentSellerId());
    return ResponseUtil.ok(res, { seller });
  }),
);

export default router;
