import { CreateSessionBody, PatchSessionBody, SessionListQuery, ExportBody } from '@shirtify/core';
import { Router, type IRouter } from 'express';

import { exportDesign } from '@features/export/export.service.js';
import { asyncHandler } from '@lib/http/asyncHandler.js';
import { requireParam } from '@lib/http/params.js';
import { ResponseUtil } from '@lib/response.js';
import { requireAuth, currentSellerId } from '@middlewares/auth.middleware.js';

import {
  createSession,
  listSessions,
  getSessionDetail,
  archiveSession,
  editSession,
} from './sessions.service.js';

const router: IRouter = Router();

router.use(requireAuth);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = CreateSessionBody.parse(req.body);
    const rawKey = req.get('Idempotency-Key');
    const idempotencyKey = rawKey && rawKey.trim().length > 0 ? rawKey.trim() : undefined;
    const session = await createSession(currentSellerId(), body, idempotencyKey);
    return ResponseUtil.created(res, { session });
  }),
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = SessionListQuery.parse(req.query);
    const page = await listSessions(currentSellerId(), {
      limit: q.limit,
      ...(q.cursor !== undefined && { cursor: q.cursor }),
      ...(q.status !== undefined && { status: q.status }),
    });
    return ResponseUtil.ok(res, { items: page.items }, {
      nextCursor: page.nextCursor,
      hasMore: page.hasMore,
    });
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const detail = await getSessionDetail(currentSellerId(), requireParam(req, 'id'));
    return ResponseUtil.ok(res, detail);
  }),
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = requireParam(req, 'id');
    const sellerId = currentSellerId();
    const body = PatchSessionBody.parse(req.body);

    if (body.status === 'archived') {
      const session = await archiveSession(sellerId, id);
      return ResponseUtil.ok(res, { session });
    }

    // Edit shirt type / colour / material / customer name.
    const edits = {
      ...(body.shirt_type !== undefined && { shirt_type: body.shirt_type }),
      ...(body.shirt_color !== undefined && { shirt_color: body.shirt_color }),
      ...(body.material_slug !== undefined && { material_slug: body.material_slug }),
      ...(body.customer_name !== undefined && { customer_name: body.customer_name }),
    };
    if (Object.keys(edits).length > 0) {
      const session = await editSession(sellerId, id, edits);
      return ResponseUtil.ok(res, { session });
    }

    const detail = await getSessionDetail(sellerId, id);
    return ResponseUtil.ok(res, { session: detail.session });
  }),
);

router.post(
  '/:id/export',
  asyncHandler(async (req, res) => {
    const id = requireParam(req, 'id');
    const body = ExportBody.parse(req.body);
    const result = await exportDesign(currentSellerId(), id, body);
    return ResponseUtil.ok(res, result);
  }),
);

export default router;
