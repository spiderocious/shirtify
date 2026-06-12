import webpush from 'web-push';

import type { Session } from '@shirtify/core';

import { env } from '../../env.js';
import { logger } from '../logger.js';
import { getRepos } from '../../repos/index.js';

let configured = false;

/** Lazily configure VAPID. Push is a no-op if keys aren't set (dev-friendly). */
const ensureConfigured = (): boolean => {
  if (configured) return true;
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return false;
  webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
  configured = true;
  return true;
};

/**
 * Notify a seller that a design was submitted. Best-effort: failures are logged,
 * never thrown — the customer's submit must not depend on push delivery.
 */
export const notifyDesignSubmitted = async (
  sellerId: string,
  session: Session,
): Promise<void> => {
  try {
    if (!ensureConfigured()) return;
    const repos = getRepos();
    const subs = await repos.pushSubscriptions.listBySeller(sellerId);
    if (subs.length === 0) return;

    const who = session.customer_name ?? 'A customer';
    const payload = JSON.stringify({
      title: 'New design submitted',
      body: `${who} submitted a ${session.shirt_type} design.`,
      sessionId: session.id,
    });

    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload,
          );
        } catch (err) {
          // 404/410 → subscription gone; prune it.
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            await repos.pushSubscriptions.removeByEndpoint(s.endpoint);
          } else {
            logger.warn({ err, endpoint: s.endpoint }, 'push send failed');
          }
        }
      }),
    );
  } catch (err) {
    logger.warn({ err, sellerId }, 'notifyDesignSubmitted failed');
  }
};

/** Build a wa.me reminder link for the seller to nudge a customer. */
export const buildWhatsAppReminder = (phone: string, text: string): string => {
  const digits = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
};
