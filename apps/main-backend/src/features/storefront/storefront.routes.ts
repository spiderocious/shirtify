import { StartSessionBody } from '@shirtify/core';
import { Router, type IRouter } from 'express';

import { asyncHandler } from '@lib/http/asyncHandler.js';
import { requireParam } from '@lib/http/params.js';
import { ResponseUtil } from '@lib/response.js';

import { getStorefront, startPublicSession } from './storefront.service.js';

const router: IRouter = Router();

// GET /api/v1/s/:slug — public storefront brand + shirt options.
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const data = await getStorefront(requireParam(req, 'slug'));
    return ResponseUtil.ok(res, data);
  }),
);

// POST /api/v1/s/:slug/start — cold walk-in → public session token.
router.post(
  '/:slug/start',
  asyncHandler(async (req, res) => {
    const slug = requireParam(req, 'slug');
    const body = StartSessionBody.parse(req.body);
    const result = await startPublicSession(slug, {
      shirt_type: body.shirt_type,
      shirt_color: body.shirt_color,
      ...(body.material_slug !== undefined && { material_slug: body.material_slug }),
    });
    return ResponseUtil.created(res, result);
  }),
);

export default router;
