import { useEffect, useState } from 'react';

/** Renders the seller's logo (resolved from its R2 key), or nothing. */
export function StorefrontLogo({
  logoKey,
  resolveAssetUrl,
}: {
  logoKey: string | null;
  resolveAssetUrl: (key: string) => Promise<string>;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!logoKey) {
      setUrl(null);
      return;
    }
    void resolveAssetUrl(logoKey).then((u) => {
      if (!cancelled) setUrl(u);
    });
    return () => {
      cancelled = true;
    };
  }, [logoKey, resolveAssetUrl]);

  if (!url) return null;
  return (
    <img
      src={url}
      alt="logo"
      className="mx-auto h-20 w-20 border-3 border-ink bg-paper-warm object-contain"
    />
  );
}
