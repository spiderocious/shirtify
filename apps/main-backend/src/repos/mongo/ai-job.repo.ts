import type { AiJob } from '@shirtify/core';
import { Types } from 'mongoose';

import { AiJobModel } from '@db/models/ai-job.model.js';
import type { AiJobRepo, NewAiJob } from '@repos/ports.js';

import { toAiJob } from './mappers.js';

const oid = (id?: string): Types.ObjectId | null =>
  id && Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;

export const createMongoAiJobRepo = (): AiJobRepo => ({
  async create(input: NewAiJob): Promise<AiJob> {
    const doc = await AiJobModel.create({
      session_id: oid(input.session_id),
      seller_id: oid(input.seller_id),
      kind: input.kind,
      status: 'pending',
      prompt: input.prompt,
      layer_id: input.layer_id ?? null,
      results: [],
      error: null,
    });
    return toAiJob(doc);
  },

  async byId(id: string): Promise<AiJob | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await AiJobModel.findById(id);
    return doc ? toAiJob(doc) : null;
  },

  async setStatus(id, status, patch): Promise<AiJob | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const update: Record<string, unknown> = { status };
    if (patch?.results) update.results = patch.results;
    if (patch?.error !== undefined) update.error = patch.error;
    const doc = await AiJobModel.findByIdAndUpdate(id, update, { new: true });
    return doc ? toAiJob(doc) : null;
  },
});
