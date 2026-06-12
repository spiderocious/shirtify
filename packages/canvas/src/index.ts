import type { CanvasOptions, CanvasHandle } from './types.js';

export type { CanvasOptions, CanvasHandle, ToPNGOptions } from './types.js';

/**
 * Mount the design canvas into a host element.
 *
 * ⚠️ Phase 0 shell: the contract is real and stable; the Konva editor surface
 * is built in Phase 4. This stub satisfies the interface so the host app can
 * wire against it today.
 */
export const mount = (_el: HTMLElement, opts: CanvasOptions): CanvasHandle => {
  const { front, back } = opts;

  return {
    addTextLayer() {
      throw new Error('canvas: addTextLayer not implemented until Phase 4');
    },
    addImageLayer(_key: string) {
      throw new Error('canvas: addImageLayer not implemented until Phase 4');
    },
    setSide(_side) {
      /* no-op until Phase 4 */
    },
    getScenes() {
      return { front, back };
    },
    async toPNG() {
      throw new Error('canvas: toPNG not implemented until Phase 4');
    },
    destroy() {
      /* no-op until Phase 4 */
    },
  };
};
