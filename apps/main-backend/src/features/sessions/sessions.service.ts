import {
  generateToken,
  type Session,
  type Design,
  type SessionStatus,
  type CreateSessionBody,
  type PaginatedResult,
} from '@shirtify/core';

import { assertColorAvailable } from '@features/colors/colors.service.js';
import { assertMaterialAvailable } from '@features/materials/materials.service.js';
import { NotFoundError } from '@lib/errors.js';
import { buildInitialScene } from '@shared/design-scene.js';
import { getRepos } from '@repos/index.js';

/** Generate a session token guaranteed unique against the store. */
const uniqueToken = async (): Promise<string> => {
  const repos = getRepos();
  let token = generateToken(8);
   
  while (await repos.sessions.tokenExists(token)) {
    token = generateToken(8);
  }
  return token;
};

export const createSession = async (
  sellerId: string,
  input: CreateSessionBody,
  idempotencyKey?: string,
): Promise<Session> => {
  const repos = getRepos();

  // Idempotency: a retried request with the same key returns the original
  // session instead of creating a duplicate (BUG-04).
  if (idempotencyKey) {
    const existingId = await repos.idempotency.lookup(sellerId, 'create_session', idempotencyKey);
    if (existingId) {
      const existing = await repos.sessions.byId(existingId);
      if (existing) return existing;
    }
  }

  // Validate the base colour (and any allowed-colour options) against the
  // seller's catalogue (platform ∪ her own) — out-of-catalogue colours rejected.
  await assertColorAvailable(sellerId, input.shirt_color);
  if (input.allowed_colors) {
    for (const slug of input.allowed_colors) {

      await assertColorAvailable(sellerId, slug);
    }
  }
  if (input.material_slug) await assertMaterialAvailable(sellerId, input.material_slug);
  const token = await uniqueToken();
  const session = await repos.sessions.create({
    seller_id: sellerId,
    kind: 'custom',
    token,
    ...(input.customer_name !== undefined && { customer_name: input.customer_name }),
    shirt_type: input.shirt_type,
    shirt_color: input.shirt_color,
    ...(input.material_slug !== undefined && { material_slug: input.material_slug }),
    ...(input.allowed_colors !== undefined && { allowed_colors: input.allowed_colors }),
    ...(input.price_quoted !== undefined && { price_quoted: input.price_quoted }),
    ...(input.notes !== undefined && { notes: input.notes }),
  });
  // Every session gets a blank design (front + back) up front, with the chosen
  // material's image resolved onto the scene backdrop.
  const front = await buildInitialScene(
    sellerId,
    session.shirt_type,
    session.shirt_color,
    session.material_slug ?? undefined,
  );
  const back = await buildInitialScene(
    sellerId,
    session.shirt_type,
    session.shirt_color,
    session.material_slug ?? undefined,
  );
  await repos.designs.createForSession(session.id, front, back);

  if (idempotencyKey) {
    const recorded = await repos.idempotency.record(
      sellerId,
      'create_session',
      idempotencyKey,
      session.id,
    );
    // Lost a race: another request recorded first — return its session.
    if (!recorded) {
      const winnerId = await repos.idempotency.lookup(sellerId, 'create_session', idempotencyKey);
      if (winnerId && winnerId !== session.id) {
        const winner = await repos.sessions.byId(winnerId);
        if (winner) return winner;
      }
    }
  }
  return session;
};

export const listSessions = async (
  sellerId: string,
  q: { cursor?: string; status?: SessionStatus; limit: number },
): Promise<PaginatedResult<Session>> => {
  const repos = getRepos();
  return repos.sessions.listBySeller(sellerId, q);
};

/** Fetch a session the seller owns, plus its design. 404 if not theirs. */
export const getSessionDetail = async (
  sellerId: string,
  id: string,
): Promise<{ session: Session; design: Design }> => {
  const repos = getRepos();
  const session = await repos.sessions.byId(id);
  if (!session || session.seller_id !== sellerId) throw new NotFoundError('Session');

  const design = await repos.designs.bySessionId(id);
  if (!design) throw new NotFoundError('Design');
  return { session, design };
};

export const setSessionVisibility = async (
  sellerId: string,
  id: string,
  visibility: Session['visibility'],
): Promise<Session> => {
  const repos = getRepos();
  const session = await repos.sessions.byId(id);
  if (!session || session.seller_id !== sellerId) throw new NotFoundError('Session');
  const updated = await repos.sessions.patch(id, { visibility });
  if (!updated) throw new NotFoundError('Session');
  return updated;
};

export const archiveSession = async (sellerId: string, id: string): Promise<Session> => {
  const repos = getRepos();
  const session = await repos.sessions.byId(id);
  if (!session || session.seller_id !== sellerId) throw new NotFoundError('Session');

  const updated = await repos.sessions.patch(id, { status: 'archived' });
  if (!updated) throw new NotFoundError('Session');
  return updated;
};

/**
 * Edit a session's shirt type / colour / material after creation. Validates the
 * new colour + material against the seller's catalogue, patches the session, and
 * mirrors the change into both design scenes so the canvas reflects it.
 */
export const editSession = async (
  sellerId: string,
  id: string,
  patch: {
    shirt_type?: Session['shirt_type'];
    shirt_color?: string;
    material_slug?: string | null;
    customer_name?: string;
  },
): Promise<Session> => {
  const repos = getRepos();
  const session = await repos.sessions.byId(id);
  if (!session || session.seller_id !== sellerId) throw new NotFoundError('Session');

  if (patch.shirt_color !== undefined) await assertColorAvailable(sellerId, patch.shirt_color);
  if (patch.material_slug) await assertMaterialAvailable(sellerId, patch.material_slug);

  const updated = await repos.sessions.patch(id, patch);
  if (!updated) throw new NotFoundError('Session');

  // Mirror shirt type/colour/material into the design scenes so the canvas
  // backdrop updates (resolving the material's uploaded image, if any).
  const design = await repos.designs.bySessionId(id);
  if (design) {
    let materialImageKey: string | undefined;
    if (updated.material_slug) {
      const materials = await repos.materials.listForSeller(sellerId);
      materialImageKey = materials.find((m) => m.slug === updated.material_slug)?.image_key ?? undefined;
    }
    const applyShirt = (scene: Design['canvas_front']): Design['canvas_front'] => ({
      ...scene,
      shirt: {
        type: updated.shirt_type,
        color: updated.shirt_color,
        ...(updated.material_slug !== null && { materialId: updated.material_slug }),
        ...(materialImageKey !== undefined && { materialImageKey }),
      },
    });
    await repos.designs.saveCanvas(id, applyShirt(design.canvas_front), applyShirt(design.canvas_back));
  }

  return updated;
};
