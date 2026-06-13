import type { AiActionKind, SceneContext } from '@shirtify/core';

/**
 * Image-provider port — the vendor-agnostic contract the AI service depends on.
 *
 * Mirrors the Repository-port pattern: the service imports ONLY these types; the
 * concrete vendor (OpenAI gpt-image-1, a fake, a future Replicate/Stability
 * adapter) lives behind `ImageProvider`. Swapping vendors = one new adapter that
 * satisfies this interface — service, routes, jobs, schemas all untouched.
 *
 * Inputs/outputs are plain domain types (Buffers, prompts, context). No vendor
 * SDK type ever crosses this boundary.
 */

/** Raw bytes the provider returns, before we upload them to R2. */
export interface GeneratedImage {
  data: Buffer;
  mime: string;
  width: number | null;
  height: number | null;
}

/** An input image handed to the provider (e.g. an edit base, a try-on photo). */
export interface SourceImage {
  data: Buffer;
  mime: string;
}

/** Common knobs every request shares. */
interface BaseRequest {
  /** How many options to return (provider clamps to its own max). */
  count: number;
  /** Structured facts about the shirt/design, for prompt-wrapping. */
  scene?: SceneContext;
}

export interface GenerateRequest extends BaseRequest {
  prompt: string;
}

export interface EditRequest extends BaseRequest {
  instruction: string;
  /** The current layer image to regenerate from. */
  base: SourceImage;
}

export interface TryOnRequest extends BaseRequest {
  /** Photo of the person. */
  person: SourceImage;
  /** Rendered snapshot of the shirt + design. */
  design: SourceImage;
  note?: string;
}

/** Which actions a given provider can fulfil. */
export type ImageCapabilities = Record<AiActionKind, boolean>;

export interface ImageProvider {
  /** Stable id for logging/telemetry, e.g. 'openai', 'fake'. */
  readonly id: string;
  readonly capabilities: ImageCapabilities;
  generate(req: GenerateRequest): Promise<GeneratedImage[]>;
  edit(req: EditRequest): Promise<GeneratedImage[]>;
  tryOn(req: TryOnRequest): Promise<GeneratedImage[]>;
}

/** Thrown by an adapter asked to do something it can't (capability gate). */
export class UnsupportedActionError extends Error {
  constructor(providerId: string, action: AiActionKind) {
    super(`Provider "${providerId}" does not support action "${action}"`);
    this.name = 'UnsupportedActionError';
  }
}
