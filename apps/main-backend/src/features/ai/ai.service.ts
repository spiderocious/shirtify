import {
  createFileService,
  type AiGenerateBody,
  type AiEditBody,
  type AiTryOnBody,
  type AiJob,
  type AiResultImage,
  type Session,
} from '@shirtify/core';

import { NotFoundError, ConflictError } from '@lib/errors.js';
import { logger } from '@lib/logger.js';
import { getRepos } from '@repos/index.js';
import { getImageProvider } from '../../providers/image/index.js';
import type { GeneratedImage, SourceImage } from '../../providers/image/ports.js';
import { env } from '../../env.js';

const fileService = createFileService({ baseUrl: env.FILE_SERVICE_URL });

/** Resolve a token to a session that is still editable (mirrors public.service). */
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

/** Decode a base64 image data URL into bytes + mime. */
const fromDataUrl = (dataUrl: string): SourceImage => {
  const match = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(dataUrl);
  if (!match) throw new ConflictError('Invalid image data');
  return { data: Buffer.from(match[2]!, 'base64'), mime: match[1]! };
};

/** Pull an existing R2 object's bytes (used as the base for an edit). */
const fetchKey = async (key: string): Promise<SourceImage> => {
  const url = await fileService.getFileUri(key);
  const res = await fetch(url);
  if (!res.ok) throw new NotFoundError('Source image');
  const buf = Buffer.from(await res.arrayBuffer());
  return { data: buf, mime: res.headers.get('content-type') ?? 'image/png' };
};

/** Upload produced images to R2 and record them as `kind:'ai'` assets. */
const persistResults = async (
  session: Session,
  images: GeneratedImage[],
): Promise<AiResultImage[]> => {
  const repos = getRepos();
  const results: AiResultImage[] = [];
  for (const img of images) {
    const ext = img.mime.includes('jpeg') ? 'jpg' : 'png';
    const key = await fileService.upload(img.data, ext, img.mime);
    await repos.assets.create({
      session_id: session.id,
      seller_id: session.seller_id,
      kind: 'ai',
      storage_key: key,
      mime: img.mime,
      ...(img.width !== null && { width: img.width }),
      ...(img.height !== null && { height: img.height }),
      bytes: img.data.byteLength,
    });
    results.push({ storage_key: key, width: img.width, height: img.height });
  }
  return results;
};

/**
 * Run a job to completion: call the provider, persist results, flip status.
 * Fire-and-forget — never throws to the caller; failures are recorded on the job
 * so the polling client surfaces them.
 */
const runJob = async (
  jobId: string,
  session: Session,
  produce: () => Promise<GeneratedImage[]>,
): Promise<void> => {
  const repos = getRepos();
  try {
    await repos.aiJobs.setStatus(jobId, 'running');
    const images = await produce();
    const results = await persistResults(session, images);
    await repos.aiJobs.setStatus(jobId, 'done', { results });
  } catch (err) {
    logger.error({ err, jobId }, 'ai job failed');
    const message = err instanceof Error ? err.message : 'Generation failed';
    await repos.aiJobs.setStatus(jobId, 'failed', { error: message });
  }
};

const COUNT = 3; // PRD: three option cards.

export const startGenerate = async (token: string, body: AiGenerateBody): Promise<AiJob> => {
  const session = await editableSession(token);
  const repos = getRepos();
  const job = await repos.aiJobs.create({
    session_id: session.id,
    seller_id: session.seller_id,
    kind: 'generate',
    prompt: body.prompt,
  });
  void runJob(job.id, session, () =>
    getImageProvider().generate({
      prompt: body.prompt,
      count: COUNT,
      ...(body.scene && { scene: body.scene }),
    }),
  );
  return job;
};

export const startEdit = async (token: string, body: AiEditBody): Promise<AiJob> => {
  const session = await editableSession(token);
  const repos = getRepos();
  const job = await repos.aiJobs.create({
    session_id: session.id,
    seller_id: session.seller_id,
    kind: 'edit',
    prompt: body.instruction,
    layer_id: body.layer_id,
  });
  void runJob(job.id, session, async () => {
    const base = await fetchKey(body.base_storage_key);
    return getImageProvider().edit({
      instruction: body.instruction,
      base,
      count: COUNT,
      ...(body.scene && { scene: body.scene }),
    });
  });
  return job;
};

export const startTryOn = async (token: string, body: AiTryOnBody): Promise<AiJob> => {
  const session = await editableSession(token);
  const repos = getRepos();
  const job = await repos.aiJobs.create({
    session_id: session.id,
    seller_id: session.seller_id,
    kind: 'tryon',
    prompt: body.note ?? '',
  });
  void runJob(job.id, session, () =>
    getImageProvider().tryOn({
      person: fromDataUrl(body.person_image),
      design: fromDataUrl(body.design_snapshot),
      count: 1, // one realistic composite, not three
      ...(body.scene && { scene: body.scene }),
      ...(body.note && { note: body.note }),
    }),
  );
  return job;
};

/** Poll: a job by id, scoped to the session that owns the token. */
export const getJob = async (token: string, jobId: string): Promise<AiJob> => {
  const repos = getRepos();
  const session = await repos.sessions.byToken(token);
  if (!session) throw new NotFoundError('Session');
  const job = await repos.aiJobs.byId(jobId);
  if (!job || job.session_id !== session.id) throw new NotFoundError('Job');
  return job;
};
