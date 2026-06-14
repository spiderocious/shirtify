import type { Scene, SceneSide } from '@shirtify/core';

/**
 * The canvas module's public contract — the stable seam between the host app
 * (apps/web) and the editor. The host owns ALL I/O (data fetching, autosave
 * debounce, R2 url resolution); the canvas owns ONLY the editing surface.
 *
 * The canvas has ZERO app knowledge: no router, no auth, no @shirtify/api, no
 * EP/ROUTES. Everything it needs comes through these options. This isolation is
 * what lets the module later become a runtime remote or an embeddable widget
 * without a rewrite.
 */
export interface CanvasOptions {
  /** Initial scenes (front + back). */
  front: Scene;
  back: Scene;
  /** Fires on every edit; the host debounces this into autosave. */
  onChange: (sides: { front: Scene; back: Scene }) => void;
  /** Host supplies a fresh R2 view URL for an image layer's storage key. */
  resolveAssetUrl: (key: string) => Promise<string>;
  /** Read-only render (dashboard preview / submitted view) — no editing chrome. */
  readOnly?: boolean;
  /** Which side to show first. */
  initialSide?: SceneSide;
}

export interface ToPNGOptions {
  side: SceneSide;
  width: number;
  height: number;
}

/** Imperative handle returned by `mount()`. */
export interface CanvasHandle {
  addTextLayer(): void;
  addImageLayer(key: string): void;
  setSide(side: SceneSide): void;
  getScenes(): { front: Scene; back: Scene };
  /** Client-side render of the current side to a PNG blob (low-res preview). */
  toPNG(opts: ToPNGOptions): Promise<Blob>;
  /**
   * PNG data URL of the current side, with selection chrome hidden — used as the
   * design snapshot fed to AI try-on. Returns null if the stage isn't ready.
   */
  snapshot(pixelRatio?: number): string | null;
  destroy(): void;
}
