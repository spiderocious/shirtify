import { wrapEdit, wrapGenerate, wrapTryOn } from './wrap-prompt.js';
import type {
  EditRequest,
  GenerateRequest,
  GeneratedImage,
  ImageProvider,
  TryOnRequest,
} from './ports.js';

/**
 * OpenAI gpt-image-1 adapter — implemented directly against the REST API with
 * `fetch` (no SDK dependency, so the whole vendor coupling is this one file).
 *
 *   generate → POST /v1/images/generations   (prompt only)
 *   edit     → POST /v1/images/edits          (prompt + base image)
 *   tryon    → POST /v1/images/edits          (prompt + [person, design] images)
 *
 * gpt-image-1 returns base64 PNGs. To swap to another vendor, write a sibling
 * adapter satisfying ImageProvider and register it in index.ts — nothing else
 * changes.
 */

const API = 'https://api.openai.com/v1';
const MODEL = 'gpt-image-1';
const MAX_OPTIONS = 4; // gpt-image-1 supports up to 10; we never ask for more than 4.

interface OpenAiImageResponse {
  data?: { b64_json?: string }[];
  error?: { message?: string };
}

const decode = (res: OpenAiImageResponse): GeneratedImage[] => {
  if (res.error) throw new Error(`gpt-image-1: ${res.error.message ?? 'unknown error'}`);
  const items = res.data ?? [];
  if (items.length === 0) throw new Error('gpt-image-1 returned no images');
  return items
    .filter((d): d is { b64_json: string } => typeof d.b64_json === 'string')
    .map((d) => ({
      data: Buffer.from(d.b64_json, 'base64'),
      mime: 'image/png',
      width: null,
      height: null,
    }));
};

const clamp = (n: number): number => Math.min(MAX_OPTIONS, Math.max(1, n));

export const createOpenAiImageProvider = (apiKey: string): ImageProvider => {
  const authHeaders = { Authorization: `Bearer ${apiKey}` };

  const generations = async (prompt: string, count: number): Promise<GeneratedImage[]> => {
    const res = await fetch(`${API}/images/generations`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        n: clamp(count),
        size: '1024x1024',
        background: 'transparent',
      }),
    });
    return decode((await res.json()) as OpenAiImageResponse);
  };

  /** Multipart edit call — `images[]` are sent as the edit base / references. */
  const edits = async (
    prompt: string,
    count: number,
    images: { data: Buffer; mime: string }[],
  ): Promise<GeneratedImage[]> => {
    const form = new FormData();
    form.append('model', MODEL);
    form.append('prompt', prompt);
    form.append('n', String(clamp(count)));
    form.append('size', '1024x1024');
    for (const img of images) {
      const ext = img.mime.includes('jpeg') ? 'jpg' : img.mime.includes('webp') ? 'webp' : 'png';
      form.append(
        'image[]',
        new Blob([new Uint8Array(img.data)], { type: img.mime }),
        `image.${ext}`,
      );
    }
    const res = await fetch(`${API}/images/edits`, {
      method: 'POST',
      headers: authHeaders, // let fetch set the multipart boundary
      body: form,
    });
    return decode((await res.json()) as OpenAiImageResponse);
  };

  return {
    id: 'openai',
    capabilities: { generate: true, edit: true, tryon: true },
    async generate(req: GenerateRequest) {
      return generations(wrapGenerate(req.prompt, req.scene), req.count);
    },
    async edit(req: EditRequest) {
      return edits(wrapEdit(req.instruction, req.scene), req.count, [req.base]);
    },
    async tryOn(req: TryOnRequest) {
      return edits(wrapTryOn(req.scene, req.note), req.count, [req.person, req.design]);
    },
  };
};
