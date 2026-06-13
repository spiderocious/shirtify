import { CreateMaterialBody } from '@shirtify/core';
import { Router, type IRouter } from 'express';

import { asyncHandler } from '@lib/http/asyncHandler.js';
import { requireParam } from '@lib/http/params.js';
import { ResponseUtil } from '@lib/response.js';
import { requireAuth, currentSellerId } from '@middlewares/auth.middleware.js';

import {
  listSellerMaterials,
  addSellerMaterial,
  removeSellerMaterial,
} from './materials.service.js';

const router: IRouter = Router();

router.use(requireAuth);

// GET /api/v1/materials — platform built-ins + the seller's own.
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const materials = await listSellerMaterials(currentSellerId());
    return ResponseUtil.ok(res, { materials });
  }),
);

// POST /api/v1/materials — add a custom material (uploaded photo).
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = CreateMaterialBody.parse(req.body);
    const material = await addSellerMaterial(currentSellerId(), body);
    return ResponseUtil.created(res, { material });
  }),
);

// DELETE /api/v1/materials/:id — remove one of the seller's own (404 on platform).
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await removeSellerMaterial(currentSellerId(), requireParam(req, 'id'));
    return ResponseUtil.noContent(res);
  }),
);

export default router;
