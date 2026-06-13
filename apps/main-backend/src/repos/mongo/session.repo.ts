import type { Session, SessionStatus, PaginatedResult } from '@shirtify/core';
import { Types } from 'mongoose';

import { SessionModel } from '@db/models/session.model.js';
import type { SessionRepo, NewSession, SessionListQuery } from '@repos/ports.js';

import { toSession } from './mappers.js';

export const createMongoSessionRepo = (): SessionRepo => ({
  async create(input: NewSession): Promise<Session> {
    const doc = await SessionModel.create({
      seller_id: new Types.ObjectId(input.seller_id),
      kind: input.kind,
      token: input.token,
      customer_name: input.customer_name ?? null,
      shirt_type: input.shirt_type,
      shirt_color: input.shirt_color,
      material_slug: input.material_slug ?? null,
      allowed_colors: input.allowed_colors ?? null,
      price_quoted: input.price_quoted ?? null,
      notes: input.notes ?? null,
    });
    return toSession(doc);
  },

  async byId(id: string): Promise<Session | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await SessionModel.findById(id);
    return doc ? toSession(doc) : null;
  },

  async byToken(token: string): Promise<Session | null> {
    const doc = await SessionModel.findOne({ token });
    return doc ? toSession(doc) : null;
  },

  async tokenExists(token: string): Promise<boolean> {
    const count = await SessionModel.countDocuments({ token }).limit(1);
    return count > 0;
  },

  async listBySeller(sellerId: string, q: SessionListQuery): Promise<PaginatedResult<Session>> {
    // Cursor = the _id of the last item on the previous page (newest-first).
    const filter: Record<string, unknown> = { seller_id: new Types.ObjectId(sellerId) };
    if (q.status) filter.status = q.status;
    if (q.cursor && Types.ObjectId.isValid(q.cursor)) {
      filter._id = { $lt: new Types.ObjectId(q.cursor) };
    }

    const docs = await SessionModel.find(filter)
      .sort({ _id: -1 })
      .limit(q.limit + 1);

    const hasMore = docs.length > q.limit;
    const page = hasMore ? docs.slice(0, q.limit) : docs;
    const last = page.at(-1);

    return {
      items: page.map(toSession),
      nextCursor: hasMore && last ? last._id.toString() : null,
      hasMore,
    };
  },

  async setStatus(
    id: string,
    status: SessionStatus,
    submittedAt?: string,
  ): Promise<Session | null> {
    const update: Record<string, unknown> = { status, last_activity_at: new Date() };
    if (submittedAt) update.last_activity_at = new Date(submittedAt);
    const doc = await SessionModel.findByIdAndUpdate(id, update, { new: true });
    return doc ? toSession(doc) : null;
  },

  async patch(
    id: string,
    patch: Partial<
      Pick<Session, 'customer_name' | 'status' | 'shirt_type' | 'shirt_color' | 'material_slug'>
    >,
  ): Promise<Session | null> {
    const doc = await SessionModel.findByIdAndUpdate(id, patch, { new: true });
    return doc ? toSession(doc) : null;
  },

  async touchActivity(id: string): Promise<void> {
    await SessionModel.findByIdAndUpdate(id, { last_activity_at: new Date() });
  },
});
