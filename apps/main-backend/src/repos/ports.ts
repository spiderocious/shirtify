import type {
  Seller,
  Session,
  Design,
  Asset,
  Scene,
  SessionKind,
  SessionStatus,
  PaginatedResult,
} from '@shirtify/core';

/**
 * Repository ports — the persistence contract the service layer depends on.
 * Services import ONLY these interfaces; the Mongoose adapter is the sole place
 * that knows about MongoDB. Swapping the database later = a new adapter that
 * satisfies these, with services and controllers untouched.
 *
 * All ids are strings; all timestamps are ISO-8601 strings (domain shape). The
 * adapter maps Mongo ObjectId/Date to/from these.
 */

/** Seller as persisted, including the password hash (never sent to clients). */
export interface SellerRecord extends Seller {
  password_hash: string;
}

export interface NewSeller {
  email: string;
  password_hash: string;
  business_name: string;
  public_slug: string;
}

export interface SellerRepo {
  create(input: NewSeller): Promise<SellerRecord>;
  byId(id: string): Promise<SellerRecord | null>;
  byEmail(email: string): Promise<SellerRecord | null>;
  bySlug(slug: string): Promise<SellerRecord | null>;
  slugExists(slug: string): Promise<boolean>;
  patchBrand(id: string, patch: Partial<Pick<Seller, 'brand_logo_key' | 'brand_colors' | 'welcome_voice' | 'business_name'>>): Promise<SellerRecord | null>;
}

export interface NewSession {
  seller_id: string;
  kind: SessionKind;
  token: string;
  customer_name?: string;
  shirt_type: Session['shirt_type'];
  shirt_color: string;
  allowed_colors?: string[];
  price_quoted?: number;
  notes?: string;
}

export interface SessionListQuery {
  cursor?: string;
  status?: SessionStatus;
  limit: number;
}

export interface SessionRepo {
  create(input: NewSession): Promise<Session>;
  byId(id: string): Promise<Session | null>;
  byToken(token: string): Promise<Session | null>;
  tokenExists(token: string): Promise<boolean>;
  listBySeller(sellerId: string, q: SessionListQuery): Promise<PaginatedResult<Session>>;
  setStatus(id: string, status: SessionStatus, submittedAt?: string): Promise<Session | null>;
  patch(id: string, patch: Partial<Pick<Session, 'customer_name' | 'status'>>): Promise<Session | null>;
  touchActivity(id: string): Promise<void>;
}

export interface SessionRepoWithSeller {
  byId(id: string, sellerId: string): Promise<Session | null>;
}

export interface DesignRepo {
  createForSession(sessionId: string, front: Scene, back: Scene): Promise<Design>;
  bySessionId(sessionId: string): Promise<Design | null>;
  saveCanvas(sessionId: string, front: Scene, back: Scene): Promise<Design | null>;
  setExportKey(sessionId: string, presetId: string, key: string): Promise<Design | null>;
  markSubmitted(sessionId: string, submittedAt: string): Promise<Design | null>;
}

export interface NewAsset {
  seller_id?: string;
  session_id?: string;
  kind: Asset['kind'];
  storage_key: string;
  mime: string;
  width?: number;
  height?: number;
  bytes?: number;
}

export interface AssetRepo {
  create(input: NewAsset): Promise<Asset>;
  byId(id: string): Promise<Asset | null>;
  byStorageKey(key: string): Promise<Asset | null>;
}

export interface PushSubscriptionRecord {
  id: string;
  seller_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionRepo {
  upsert(input: Omit<PushSubscriptionRecord, 'id'>): Promise<PushSubscriptionRecord>;
  listBySeller(sellerId: string): Promise<PushSubscriptionRecord[]>;
  removeByEndpoint(endpoint: string): Promise<void>;
}

/** The full set of repositories, injected into services as one bag. */
export interface Repositories {
  sellers: SellerRepo;
  sessions: SessionRepo;
  designs: DesignRepo;
  assets: AssetRepo;
  pushSubscriptions: PushSubscriptionRepo;
}
