import { CreateColorBody } from '@shirtify/core';
import { Router, type IRouter } from 'express';

import { asyncHandler } from '@lib/http/asyncHandler.js';
import { requireParam } from '@lib/http/params.js';
import { ResponseUtil } from '@lib/response.js';
import { requireAuth, currentSellerId } from '@middlewares/auth.middleware.js';

import {
  listSellerColors,
  addSellerColor,
  removeSellerColor,
} from './colors.service.js';

const router: IRouter = Router();

router.use(requireAuth);

// GET /api/v1/colors — platform colours + the seller's own.
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const colors = await listSellerColors(currentSellerId());
    return ResponseUtil.ok(res, { colors });
  }),
);

// POST /api/v1/colors — add one of the seller's own colours.
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = CreateColorBody.parse(req.body);
    const color = await addSellerColor(currentSellerId(), body);
    return ResponseUtil.created(res, { color });
  }),
);

// DELETE /api/v1/colors/:id — remove one of the seller's own colours (404 on platform).
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await removeSellerColor(currentSellerId(), requireParam(req, 'id'));
    return ResponseUtil.noContent(res);
  }),
);

export default router;
