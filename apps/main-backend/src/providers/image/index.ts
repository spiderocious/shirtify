import { env } from '../../env.js';

import { createFakeImageProvider } from './fake.provider.js';
import { createOpenAiImageProvider } from './openai.provider.js';
import type { ImageProvider } from './ports.js';

/**
 * Composition root for the image provider — the ONE place that picks the
 * concrete vendor. Real OpenAI when a key is set; otherwise the offline fake
 * (dev + tests). Swapping vendors means editing only this file.
 */
let provider: ImageProvider | null = null;

export const getImageProvider = (): ImageProvider => {
  if (!provider) {
    provider =
      env.OPENAI_API_KEY && env.NODE_ENV !== 'test'
        ? createOpenAiImageProvider(env.OPENAI_API_KEY)
        : createFakeImageProvider();
  }
  return provider;
};

/** Test seam: force a specific provider (or reset to env-derived). */
export const __setImageProvider = (p: ImageProvider | null): void => {
  provider = p;
};

export type { ImageProvider } from './ports.js';
