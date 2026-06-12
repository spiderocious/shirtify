import type { Design, Scene } from '@shirtify/core';
import { Types } from 'mongoose';

import { DesignModel } from '@db/models/design.model.js';
import type { DesignRepo } from '@repos/ports.js';

import { toDesign } from './mappers.js';

export const createMongoDesignRepo = (): DesignRepo => ({
  async createForSession(sessionId: string, front: Scene, back: Scene): Promise<Design> {
    const doc = await DesignModel.create({
      session_id: new Types.ObjectId(sessionId),
      canvas_front: front,
      canvas_back: back,
    });
    return toDesign(doc);
  },

  async bySessionId(sessionId: string): Promise<Design | null> {
    if (!Types.ObjectId.isValid(sessionId)) return null;
    const doc = await DesignModel.findOne({ session_id: new Types.ObjectId(sessionId) });
    return doc ? toDesign(doc) : null;
  },

  async saveCanvas(sessionId: string, front: Scene, back: Scene): Promise<Design | null> {
    const doc = await DesignModel.findOneAndUpdate(
      { session_id: new Types.ObjectId(sessionId) },
      { canvas_front: front, canvas_back: back },
      { new: true },
    );
    return doc ? toDesign(doc) : null;
  },

  async setExportKey(sessionId: string, presetId: string, key: string): Promise<Design | null> {
    const doc = await DesignModel.findOneAndUpdate(
      { session_id: new Types.ObjectId(sessionId) },
      { $set: { [`export_keys.${presetId}`]: key } },
      { new: true },
    );
    return doc ? toDesign(doc) : null;
  },

  async markSubmitted(sessionId: string, submittedAt: string): Promise<Design | null> {
    const doc = await DesignModel.findOneAndUpdate(
      { session_id: new Types.ObjectId(sessionId) },
      { submitted_at: new Date(submittedAt) },
      { new: true },
    );
    return doc ? toDesign(doc) : null;
  },
});
