import { useEffect, useState } from 'react';

/**
 * Loads an image element for an asset key via the host-provided resolver.
 * Returns null until the image has loaded. The resolver yields a fresh (~1h)
 * presigned URL; we only refetch when the key changes.
 */
export function useAssetImage(
  assetKey: string,
  resolveAssetUrl: (key: string) => Promise<string>,
): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setImage(null);
    void (async () => {
      try {
        const url = await resolveAssetUrl(assetKey);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (!cancelled) setImage(img);
        };
        img.src = url;
      } catch {
        // Leave as null; the layer simply doesn't render its bitmap.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [assetKey, resolveAssetUrl]);

  return image;
}
