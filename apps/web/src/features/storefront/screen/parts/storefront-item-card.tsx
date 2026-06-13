import { DesignCanvas } from '@shirtify/canvas';
import { SHIRT_TYPE_LABELS, type StorefrontItem } from '@shirtify/core';
import { AppText } from '@shirtify/ui';
import { useEffect, useState } from 'react';

import { resolveAssetUrl } from '@shared/api/resolve-asset-url.ts';

/** Resolves + shows a material's uploaded photo, or a garment glyph fallback. */
function MaterialThumb({ imageKey, shape }: { imageKey: string | null; shape: string | null }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!imageKey) {
      setUrl(null);
      return;
    }
    void resolveAssetUrl(imageKey).then((u) => {
      if (!cancelled) setUrl(u);
    });
    return () => {
      cancelled = true;
    };
  }, [imageKey]);

  if (url) {
    return <img src={url} alt="" className="h-full w-full object-cover" />;
  }
  return (
    <div className="flex h-full w-full items-center justify-center text-6xl text-ink-3">
      {shape === 'hoodie' || shape === 'oversized' ? '🧥' : shape === 'polo' ? '🎽' : '👕'}
    </div>
  );
}

/** One storefront card — a public design preview, or a material (photo or glyph). */
export function StorefrontItemCard({
  item,
  onPick,
  showLabel = true,
}: {
  item: StorefrontItem;
  onPick: () => void;
  showLabel?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="group flex flex-col border-3 border-ink bg-paper-warm text-left shadow-pop transition-[transform,box-shadow] duration-[60ms] hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none"
    >
      <div className="relative aspect-square w-full overflow-hidden border-b-3 border-ink bg-paper-deep">
        {item.kind === 'design' ? (
          <div className="pointer-events-none flex h-full w-full items-center justify-center">
            <DesignCanvas
              front={item.preview}
              back={item.preview}
              side="front"
              readOnly
              resolveAssetUrl={resolveAssetUrl}
              onChange={() => undefined}
              className="h-full w-full"
            />
          </div>
        ) : (
          <MaterialThumb imageKey={item.image_key} shape={item.builtin_shape} />
        )}
      </div>
      {showLabel ? (
        <div className="flex items-center justify-between gap-2 px-3 py-2.5">
          <AppText variant="body-sm" as="span" className="truncate font-bold !text-ink">
            {item.label}
          </AppText>
          <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.08em] text-ink-3">
            {item.kind === 'design' ? SHIRT_TYPE_LABELS[item.shirt_type] : 'blank'}
          </span>
        </div>
      ) : null}
    </button>
  );
}
