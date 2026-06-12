import {
  EXPORT_PRESETS,
  createFileService,
  type ExportBody,
} from '@shirtify/core';

import { NotFoundError, ValidationError } from '@lib/errors.js';
import { getRepos } from '@repos/index.js';
import { env } from '../../env.js';

import { renderSceneToPng, type RenderTarget } from './renderer.js';

const fileService = createFileService({ baseUrl: env.FILE_SERVICE_URL });

const resolveTarget = (body: ExportBody): { target: RenderTarget; presetId: string } => {
  if (body.preset) {
    const preset = EXPORT_PRESETS.find((p) => p.id === body.preset);
    if (!preset) throw new ValidationError('Unknown export preset', { preset: ['invalid'] });
    return { target: { width: preset.width, height: preset.height }, presetId: preset.id };
  }
  if (body.w && body.h) {
    return { target: { width: body.w, height: body.h }, presetId: `custom-${body.w}x${body.h}` };
  }
  throw new ValidationError('Provide a preset or both w and h', { size: ['required'] });
};

/**
 * Render a session's design (front or back) to a transparent PNG at the chosen
 * size, upload it to R2, persist the key on the design, and return a fresh view
 * url. Seller must own the session.
 */
export const exportDesign = async (
  sellerId: string,
  sessionId: string,
  body: ExportBody,
): Promise<{ key: string; url: string }> => {
  const repos = getRepos();
  const session = await repos.sessions.byId(sessionId);
  if (!session || session.seller_id !== sellerId) throw new NotFoundError('Session');

  const design = await repos.designs.bySessionId(sessionId);
  if (!design) throw new NotFoundError('Design');

  const { target, presetId } = resolveTarget(body);
  const scene = body.side === 'back' ? design.canvas_back : design.canvas_front;

  const png = await renderSceneToPng(scene, target, (key) => fileService.getFileUri(key));

  const key = await fileService.upload(png, 'png', 'image/png');
  await repos.designs.setExportKey(sessionId, `${presetId}-${body.side}`, key);
  await repos.assets.create({
    seller_id: sellerId,
    session_id: sessionId,
    kind: 'export',
    storage_key: key,
    mime: 'image/png',
    width: target.width,
    height: target.height,
  });

  const url = await fileService.getFileUri(key);
  return { key, url };
};
