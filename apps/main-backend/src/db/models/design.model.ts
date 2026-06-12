import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

// Scene JSON is stored opaquely (Mixed) and validated by Zod at the repo
// boundary, so the canvas schema lives in one place (@shirtify/core), not here.
const designSchema = new Schema(
  {
    session_id: { type: Schema.Types.ObjectId, ref: 'Session', required: true, unique: true },
    canvas_front: { type: Schema.Types.Mixed, required: true },
    canvas_back: { type: Schema.Types.Mixed, required: true },
    submitted_at: { type: Date, default: null },
    export_keys: { type: Schema.Types.Mixed, default: () => ({}) },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, minimize: false },
);

export type DesignDoc = HydratedDocument<InferSchemaType<typeof designSchema>>;
export const DesignModel = model('Design', designSchema);
