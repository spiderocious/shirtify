import {
  PublicSessionSchema,
  SceneSchema,
  type Scene,
  type Design,
  type Asset,
  type PublicSession,
  type PublicBrand,
  type Session,
  type RegisterAssetBody,
} from '@shirtify/core';

import { NotFoundError, ConflictError } from '@lib/errors.js';
import { getRepos } from '@repos/index.js';
import { toPublicBrand } from '@shared/brand.js';

const toPublicSession = (session: Session): PublicSession =>
  PublicSessionSchema.parse({
    id: session.id,
    kind: session.kind,
    token: session.token,
    customer_name: session.customer_name,
    shirt_type: session.shirt_type,
    shirt_color: session.shirt_color,
    material_slug: session.material_slug,
    allowed_colors: session.allowed_colors,
    status: session.status,
  });

/** Load the full design context for a customer link. */
export const getPublicSession = async (
  token: string,
): Promise<{ session: PublicSession; design: Design; brand: PublicBrand }> => {
  const repos = getRepos();
  const session = await repos.sessions.byToken(token);
  if (!session) throw new NotFoundError('Session');

  const [design, seller] = await Promise.all([
    repos.designs.bySessionId(session.id),
    repos.sellers.byId(session.seller_id),
  ]);
  if (!design) throw new NotFoundError('Design');
  if (!seller) throw new NotFoundError('Seller');

  return { session: toPublicSession(session), design, brand: toPublicBrand(seller) };
};

/** Resolve a token to a session that is still editable. */
const editableSession = async (token: string): Promise<Session> => {
  const repos = getRepos();
  const session = await repos.sessions.byToken(token);
  if (!session) throw new NotFoundError('Session');
  if (session.status === 'submitted') {
    throw new ConflictError('This design has already been submitted');
  }
  if (session.status === 'archived') {
    throw new ConflictError('This design link is no longer active');
  }
  return session;
};

export const saveDesign = async (
  token: string,
  front: Scene,
  back: Scene,
): Promise<Design> => {
  // Defensive re-parse — the canvas is the untrusted edge.
  SceneSchema.parse(front);
  SceneSchema.parse(back);

  const repos = getRepos();
  const session = await editableSession(token);
  const design = await repos.designs.saveCanvas(session.id, front, back);
  if (!design) throw new NotFoundError('Design');
  await repos.sessions.touchActivity(session.id);
  return design;
};

export const registerUploadedAsset = async (
  token: string,
  input: RegisterAssetBody,
): Promise<Asset> => {
  const repos = getRepos();
  const session = await editableSession(token);
  const asset = await repos.assets.create({
    session_id: session.id,
    seller_id: session.seller_id,
    kind: 'upload',
    storage_key: input.storage_key,
    mime: input.mime,
    ...(input.width !== undefined && { width: input.width }),
    ...(input.height !== undefined && { height: input.height }),
    ...(input.bytes !== undefined && { bytes: input.bytes }),
  });
  await repos.sessions.touchActivity(session.id);
  return asset;
};

export const submitDesign = async (
  token: string,
  customerName?: string,
): Promise<Session> => {
  const repos = getRepos();
  const session = await editableSession(token);

  // Public sessions may capture the customer name only at submit time.
  if (customerName && !session.customer_name) {
    await repos.sessions.patch(session.id, { customer_name: customerName });
  }

  const submittedAt = new Date().toISOString();
  const updated = await repos.sessions.setStatus(session.id, 'submitted', submittedAt);
  if (!updated) throw new NotFoundError('Session');
  await repos.designs.markSubmitted(session.id, submittedAt);
  return updated;
};
