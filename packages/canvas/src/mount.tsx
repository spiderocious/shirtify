import { createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { DesignCanvas } from './design-canvas.tsx';
import type { CanvasOptions, CanvasHandle } from './types.ts';

/**
 * Framework-agnostic entry point: mounts the React `DesignCanvas` into a host
 * element and returns the imperative handle. React hosts should prefer
 * `<DesignCanvas>` directly; `mount()` exists so the module can later be driven
 * from a non-React host or a web-component shell without a rewrite.
 */
export const mount = (el: HTMLElement, opts: CanvasOptions): CanvasHandle => {
  const handleRef = createRef<CanvasHandle>();
  const root: Root = createRoot(el);
  root.render(<DesignCanvas ref={handleRef} {...opts} />);

  return {
    addTextLayer: () => handleRef.current?.addTextLayer(),
    addImageLayer: (key) => handleRef.current?.addImageLayer(key),
    setSide: (side) => handleRef.current?.setSide(side),
    getScenes: () => handleRef.current?.getScenes() ?? { front: opts.front, back: opts.back },
    toPNG: (o) => {
      if (!handleRef.current) throw new Error('canvas not mounted');
      return handleRef.current.toPNG(o);
    },
    snapshot: (pixelRatio) => handleRef.current?.snapshot(pixelRatio) ?? null,
    destroy: () => root.unmount(),
  };
};
