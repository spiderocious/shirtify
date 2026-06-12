import { z } from 'zod';

import { EXPORT_PRESET_IDS } from '../constants/shirt.js';
import {
  SellerSchema,
  SessionSchema,
  DesignSchema,
  PublicSessionSchema,
  PublicBrandSchema,
  SessionStatus,
} from './domain.js';
import { ShirtTypeSchema, SceneSchema } from './scene.js';

/**
 * Request/response body schemas — the wire contract. The backend parses inbound
 * bodies with the `*Body` schemas; the frontend infers its payload/response
 * types from the same definitions. This is where contract drift is killed.
 */

// ---- Auth ----
export const RegisterBody = z.object({
  email: z.string().email(),
  business_name: z.string().min(1),
  password: z.string().min(8),
});
export type RegisterBody = z.infer<typeof RegisterBody>;

export const LoginBody = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type LoginBody = z.infer<typeof LoginBody>;

export const RefreshBody = z.object({
  refresh_token: z.string().min(1),
});
export type RefreshBody = z.infer<typeof RefreshBody>;

export const TokenPair = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
});
export type TokenPair = z.infer<typeof TokenPair>;

export const AuthResponse = z.object({
  seller: SellerSchema,
  access_token: z.string(),
  refresh_token: z.string(),
});
export type AuthResponse = z.infer<typeof AuthResponse>;

// ---- Sessions (seller) ----
export const CreateSessionBody = z.object({
  customer_name: z.string().min(1).optional(),
  shirt_type: ShirtTypeSchema,
  shirt_color: z.string().min(1),
  allowed_colors: z.array(z.string()).optional(),
  price_quoted: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});
export type CreateSessionBody = z.infer<typeof CreateSessionBody>;

export const PatchSessionBody = z.object({
  status: z.literal('archived').optional(),
});
export type PatchSessionBody = z.infer<typeof PatchSessionBody>;

export const SessionListQuery = z.object({
  cursor: z.string().optional(),
  status: SessionStatus.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type SessionListQuery = z.infer<typeof SessionListQuery>;

export const SessionListResponse = z.object({
  items: z.array(SessionSchema),
});
export const SessionListMeta = z.object({
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});
export type SessionListMeta = z.infer<typeof SessionListMeta>;

export const SessionDetailResponse = z.object({
  session: SessionSchema,
  design: DesignSchema,
});
export type SessionDetailResponse = z.infer<typeof SessionDetailResponse>;

// ---- Public design surface ----
export const PublicSessionResponse = z.object({
  session: PublicSessionSchema,
  design: DesignSchema,
  brand: PublicBrandSchema,
});
export type PublicSessionResponse = z.infer<typeof PublicSessionResponse>;

export const SaveDesignBody = z.object({
  canvas_front: SceneSchema,
  canvas_back: SceneSchema,
});
export type SaveDesignBody = z.infer<typeof SaveDesignBody>;

export const RegisterAssetBody = z.object({
  storage_key: z.string().min(1),
  mime: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  bytes: z.number().int().positive().optional(),
});
export type RegisterAssetBody = z.infer<typeof RegisterAssetBody>;

export const SubmitBody = z.object({
  customer_name: z.string().min(1).optional(),
});
export type SubmitBody = z.infer<typeof SubmitBody>;

// ---- Storefront ----
export const StorefrontResponse = z.object({
  brand: PublicBrandSchema,
  shirt_types: z.array(ShirtTypeSchema),
  shirt_colors: z.array(z.string()),
});
export type StorefrontResponse = z.infer<typeof StorefrontResponse>;

export const StartSessionBody = z.object({
  shirt_type: ShirtTypeSchema,
  shirt_color: z.string().min(1),
});
export type StartSessionBody = z.infer<typeof StartSessionBody>;

export const StartSessionResponse = z.object({
  token: z.string(),
});
export type StartSessionResponse = z.infer<typeof StartSessionResponse>;

// ---- Export ----
export const ExportBody = z
  .object({
    preset: z.enum(EXPORT_PRESET_IDS as [string, ...string[]]).optional(),
    w: z.number().int().min(64).max(10000).optional(),
    h: z.number().int().min(64).max(10000).optional(),
    dpi: z.number().int().min(72).max(600).optional(),
    side: z.enum(['front', 'back']).default('front'),
  })
  .refine((b) => b.preset !== undefined || (b.w !== undefined && b.h !== undefined), {
    message: 'Provide a preset or both w and h',
  });
export type ExportBody = z.infer<typeof ExportBody>;

export const ExportResponse = z.object({
  key: z.string(),
  url: z.string(),
});
export type ExportResponse = z.infer<typeof ExportResponse>;

// ---- Notifications ----
export const PushSubscriptionBody = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
});
export type PushSubscriptionBody = z.infer<typeof PushSubscriptionBody>;
