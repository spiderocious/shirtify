import { PushSubscriptionBody } from '@shirtify/core';
import { Router, type IRouter } from 'express';

import { asyncHandler } from '@lib/http/asyncHandler.js';
import { ResponseUtil } from '@lib/response.js';
import { requireAuth, currentSellerId } from '@middlewares/auth.middleware.js';
import { getRepos } from '@repos/index.js';

const router: IRouter = Router();

router.use(requireAuth);

// POST /api/v1/notifications/subscribe — register a web-push subscription.
router.post(
  '/subscribe',
  asyncHandler(async (req, res) => {
    const body = PushSubscriptionBody.parse(req.body);
    const repos = getRepos();
    await repos.pushSubscriptions.upsert({
      seller_id: currentSellerId(),
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
    });
    return ResponseUtil.noContent(res);
  }),
);

export default router;
