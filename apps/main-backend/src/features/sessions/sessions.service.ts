import {
  generateToken,
  emptyScene,
  type Session,
  type Design,
  type SessionStatus,
  type CreateSessionBody,
  type PaginatedResult,
} from '@shirtify/core';

import { assertColorAvailable } from '@features/colors/colors.service.js';
import { NotFoundError } from '@lib/errors.js';
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
  const token = await uniqueToken();
  const session = await repos.sessions.create({
    seller_id: sellerId,
    kind: 'custom',
    token,
    ...(input.customer_name !== undefined && { customer_name: input.customer_name }),
    shirt_type: input.shirt_type,
    shirt_color: input.shirt_color,
    ...(input.allowed_colors !== undefined && { allowed_colors: input.allowed_colors }),
    ...(input.price_quoted !== undefined && { price_quoted: input.price_quoted }),
    ...(input.notes !== undefined && { notes: input.notes }),
  });
  // Every session gets a blank design (front + back) up front.
  await repos.designs.createForSession(
    session.id,
    emptyScene(session.shirt_type, session.shirt_color),
    emptyScene(session.shirt_type, session.shirt_color),
  );

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

export const archiveSession = async (sellerId: string, id: string): Promise<Session> => {
  const repos = getRepos();
  const session = await repos.sessions.byId(id);
  if (!session || session.seller_id !== sellerId) throw new NotFoundError('Session');

  const updated = await repos.sessions.patch(id, { status: 'archived' });
  if (!updated) throw new NotFoundError('Session');
  return updated;
};
