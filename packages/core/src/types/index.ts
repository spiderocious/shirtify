// Domain types are inferred from the Zod schemas (single source of truth).
// Re-exported here so consumers can `import type { Session } from '@shirtify/core'`.

export type {
  Seller,
  SellerRole,
  BrandColors,
  PublicBrand,
  Session,
  SessionKind,
  SessionStatus,
  PublicSession,
  Design,
  Asset,
  AssetKind,
} from '../schemas/domain.js';

export type {
  Scene,
  SceneSide,
  Layer,
  TextLayer,
  ImageLayer,
  ShirtType,
} from '../schemas/scene.js';

/** Cursor-paginated result shape, shared across list endpoints. */
export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
