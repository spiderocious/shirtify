import { UpdateBrandBody } from '@shirtify/core';
import { Router, type IRouter } from 'express';

import { asyncHandler } from '@lib/http/asyncHandler.js';
import { ResponseUtil } from '@lib/response.js';
import { requireAuth, currentSellerId } from '@middlewares/auth.middleware.js';

import { getSellerById, updateBrand } from './auth.service.js';

const router: IRouter = Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const seller = await getSellerById(currentSellerId());
    return ResponseUtil.ok(res, { seller });
  }),
);

// PATCH /api/v1/me/brand — update storefront/brand config.
router.patch(
  '/brand',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = UpdateBrandBody.parse(req.body);
    const seller = await updateBrand(currentSellerId(), body);
    return ResponseUtil.ok(res, { seller });
  }),
);

export default router;
