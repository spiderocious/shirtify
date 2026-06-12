import { SaveDesignBody, RegisterAssetBody, SubmitBody } from '@shirtify/core';
import { Router, type IRouter } from 'express';

import { asyncHandler } from '@lib/http/asyncHandler.js';
import { requireParam } from '@lib/http/params.js';
import { notifyDesignSubmitted } from '@lib/notify/push.js';
import { ResponseUtil } from '@lib/response.js';

import {
  getPublicSession,
  saveDesign,
  registerUploadedAsset,
  submitDesign,
} from './public.service.js';

const router: IRouter = Router({ mergeParams: true });

// GET /api/v1/c/:token — load the customer design context.
router.get(
  '/:token',
  asyncHandler(async (req, res) => {
    const data = await getPublicSession(requireParam(req, 'token'));
    return ResponseUtil.ok(res, data);
  }),
);

// PUT /api/v1/c/:token/design — debounced autosave.
router.put(
  '/:token/design',
  asyncHandler(async (req, res) => {
    const token = requireParam(req, 'token');
    const body = SaveDesignBody.parse(req.body);
    const design = await saveDesign(token, body.canvas_front, body.canvas_back);
    return ResponseUtil.ok(res, { design });
  }),
);

// POST /api/v1/c/:token/assets — record an uploaded R2 key as a layer asset.
router.post(
  '/:token/assets',
  asyncHandler(async (req, res) => {
    const token = requireParam(req, 'token');
    const body = RegisterAssetBody.parse(req.body);
    const asset = await registerUploadedAsset(token, body);
    return ResponseUtil.created(res, { asset });
  }),
);

// POST /api/v1/c/:token/submit — finalise and route back to the seller.
router.post(
  '/:token/submit',
  asyncHandler(async (req, res) => {
    const token = requireParam(req, 'token');
    const body = SubmitBody.parse(req.body);
    const session = await submitDesign(token, body.customer_name);
    // Fire-and-forget push to the seller; never blocks the customer response.
    void notifyDesignSubmitted(session.seller_id, session);
    return ResponseUtil.ok(res, { session });
  }),
);

export default router;
