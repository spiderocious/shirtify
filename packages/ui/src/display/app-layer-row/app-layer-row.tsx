import { type HTMLAttributes } from 'react';

import { cn } from '../../utils/cn.ts';

/**
 * Shirtify layer row — stance #28 Neobrutalist pop.
 * Visual spec: design-system/projects/shirtify/preview/20-layers.html (.layer)
 *
 * One row in the design tool's layer stack. A type-tinted thumbnail (text /
 * image / shape / ai), the layer name, a mono transform read, and a trash
 * action. The selected row fills lime and lifts onto its shadow. Drag props
 * (draggable, onDragStart/Over/Drop) pass through for reorder-by-drag.
 */
export type AppLayerKind = 'text' | 'image' | 'shape' | 'ai';

export interface AppLayerRowProps extends HTMLAttributes<HTMLDivElement> {
  readonly kind: AppLayerKind;
  readonly name: string;
  readonly meta: string;
  readonly selected?: boolean;
  readonly onSelect?: () => void;
  readonly onDelete?: () => void;
}

const THUMB: Record<AppLayerKind, { className: string; glyph: string }> = {
  text: { className: 'bg-paper-warm text-ink', glyph: 'T' },
  image: { className: 'bg-blue text-white', glyph: '⬚' },
  shape: { className: 'bg-lime text-lime-ink', glyph: '◆' },
  ai: { className: 'bg-blue text-white', glyph: '✦' },
};

export function AppLayerRow({
  kind,
  name,
  meta,
  selected = false,
  onSelect,
  onDelete,
  className,
  ...rest
}: AppLayerRowProps) {
  const thumb = THUMB[kind];
  return (
    <div
      onClick={onSelect}
      className={cn(
        'flex cursor-grab items-center gap-[11px] border-2.5 border-ink px-[11px] py-[9px]',
        selected ? 'bg-lime shadow-pop-sm' : 'bg-paper-warm',
        className,
      )}
      {...rest}
    >
      <span className="font-mono text-sm text-ink-3" aria-hidden>
        ⠿
      </span>
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center border-2.5 border-ink font-display text-[11px]',
          thumb.className,
        )}
      >
        {thumb.glyph}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-heavy text-[13.5px] font-bold text-ink">{name}</span>
        <span
          className={cn(
            'mt-px block font-mono text-[10px]',
            selected ? 'text-lime-ink' : 'text-ink-3',
          )}
        >
          {meta}
        </span>
      </span>
      {onDelete ? (
        <button
          type="button"
          aria-label="Delete layer"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex h-7 w-7 items-center justify-center text-base text-crit hover:bg-crit hover:text-white"
        >
          🗑
        </button>
      ) : null}
    </div>
  );
}
