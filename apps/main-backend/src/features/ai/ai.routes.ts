import { AiGenerateBody, AiEditBody, AiTryOnBody } from '@shirtify/core';
import { Router, type IRouter } from 'express';

import { asyncHandler } from '@lib/http/asyncHandler.js';
import { requireParam } from '@lib/http/params.js';
import { ResponseUtil } from '@lib/response.js';

import { startGenerate, startEdit, startTryOn, getJob } from './ai.service.js';

const router: IRouter = Router({ mergeParams: true });

// POST /api/v1/c/:token/ai/generate — prompt → 3 design options (async job).
router.post(
  '/:token/ai/generate',
  asyncHandler(async (req, res) => {
    const token = requireParam(req, 'token');
    const body = AiGenerateBody.parse(req.body);
    const job = await startGenerate(token, body);
    return ResponseUtil.created(res, { job });
  }),
);

// POST /api/v1/c/:token/ai/edit — regenerate a layer from an instruction (async).
router.post(
  '/:token/ai/edit',
  asyncHandler(async (req, res) => {
    const token = requireParam(req, 'token');
    const body = AiEditBody.parse(req.body);
    const job = await startEdit(token, body);
    return ResponseUtil.created(res, { job });
  }),
);

// POST /api/v1/c/:token/ai/tryon — person photo + design snapshot → worn preview.
router.post(
  '/:token/ai/tryon',
  asyncHandler(async (req, res) => {
    const token = requireParam(req, 'token');
    const body = AiTryOnBody.parse(req.body);
    const job = await startTryOn(token, body);
    return ResponseUtil.created(res, { job });
  }),
);

// GET /api/v1/c/:token/ai/jobs/:id — poll a job's status/results.
router.get(
  '/:token/ai/jobs/:id',
  asyncHandler(async (req, res) => {
    const token = requireParam(req, 'token');
    const job = await getJob(token, requireParam(req, 'id'));
    return ResponseUtil.ok(res, { job });
  }),
);

export default router;
