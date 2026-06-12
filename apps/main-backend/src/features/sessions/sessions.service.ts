import {
  generateToken,
  emptyScene,
  type Session,
  type Design,
  type SessionStatus,
  type CreateSessionBody,
  type PaginatedResult,
} from '@shirtify/core';

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
): Promise<Session> => {
  const repos = getRepos();
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
