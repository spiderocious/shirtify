import { useEffect, useState } from 'react';

/**
 * Returns a counter that bumps when web fonts finish loading, so the Konva stage
 * re-renders text with the right metrics (Konva caches glyph measurements, so a
 * font that loads after first paint won't apply without a redraw).
 */
export function useFontsReady(): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (!fonts) return;
    let cancelled = false;
    const bump = () => {
      if (!cancelled) setTick((t) => t + 1);
    };
    void fonts.ready.then(bump);
    fonts.addEventListener?.('loadingdone', bump);
    return () => {
      cancelled = true;
      fonts.removeEventListener?.('loadingdone', bump);
    };
  }, []);

  return tick;
}
