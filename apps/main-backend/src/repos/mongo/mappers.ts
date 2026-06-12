import {
  SellerSchema,
  SessionSchema,
  DesignSchema,
  AssetSchema,
  type Seller,
  type Session,
  type Design,
  type Asset,
} from '@shirtify/core';

import type { SellerDoc } from '@db/models/seller.model.js';
import type { SessionDoc } from '@db/models/session.model.js';
import type { DesignDoc } from '@db/models/design.model.js';
import type { AssetDoc } from '@db/models/asset.model.js';
import type { SellerRecord } from '@repos/ports.js';

/**
 * Doc → domain mappers. The single boundary where Mongo's ObjectId/Date shape
 * becomes the domain's string-id/ISO-string shape. Every mapper Zod-parses its
 * output so a drifted document fails loudly here, not three layers downstream
 * (hard-lessons: never trust unparsed external data).
 */

const iso = (d: Date | null | undefined): string | null =>
  d ? new Date(d).toISOString() : null;

export const toSellerRecord = (doc: SellerDoc): SellerRecord => {
  const seller: Seller = SellerSchema.parse({
    id: doc._id.toString(),
    email: doc.email,
    business_name: doc.business_name,
    public_slug: doc.public_slug,
    brand_logo_key: doc.brand_logo_key ?? null,
    brand_colors: doc.brand_colors ?? null,
    welcome_voice: doc.welcome_voice ?? null,
    role: doc.role,
    created_at: iso(doc.created_at) ?? new Date().toISOString(),
  });
  return { ...seller, password_hash: doc.password_hash };
};

export const toSession = (doc: SessionDoc): Session =>
  SessionSchema.parse({
    id: doc._id.toString(),
    seller_id: doc.seller_id.toString(),
    kind: doc.kind,
    token: doc.token,
    customer_name: doc.customer_name ?? null,
    shirt_type: doc.shirt_type,
    shirt_color: doc.shirt_color,
    allowed_colors: doc.allowed_colors ?? null,
    price_quoted: doc.price_quoted ?? null,
    notes: doc.notes ?? null,
    status: doc.status,
    created_at: iso(doc.created_at) ?? new Date().toISOString(),
    last_activity_at: iso(doc.last_activity_at) ?? new Date().toISOString(),
  });

export const toDesign = (doc: DesignDoc): Design =>
  DesignSchema.parse({
    id: doc._id.toString(),
    session_id: doc.session_id.toString(),
    canvas_front: doc.canvas_front,
    canvas_back: doc.canvas_back,
    submitted_at: iso(doc.submitted_at),
    export_keys: doc.export_keys ?? null,
    updated_at: iso(doc.updated_at) ?? new Date().toISOString(),
  });

export const toAsset = (doc: AssetDoc): Asset =>
  AssetSchema.parse({
    id: doc._id.toString(),
    seller_id: doc.seller_id ? doc.seller_id.toString() : null,
    session_id: doc.session_id ? doc.session_id.toString() : null,
    kind: doc.kind,
    storage_key: doc.storage_key,
    mime: doc.mime,
    width: doc.width ?? null,
    height: doc.height ?? null,
    bytes: doc.bytes ?? null,
    created_at: iso(doc.created_at) ?? new Date().toISOString(),
  });
