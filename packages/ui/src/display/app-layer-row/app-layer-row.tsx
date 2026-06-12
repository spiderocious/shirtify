import { cn } from '../../utils/cn.ts';

/**
 * Shirtify layer row — stance #28 Neobrutalist pop.
 * Visual spec: design-system/projects/shirtify/preview/20-layers.html (.layer)
 *
 * One row in the design tool's layer stack. A type-tinted thumbnail (text /
 * image / ai), the layer name, a mono transform read, and an eye toggle. The
 * selected row fills lime and lifts onto its shadow. Controlled — pass
 * `selected` + `onSelect` + `visible` + `onToggleVisible`.
 */
export type AppLayerKind = 'text' | 'image' | 'ai';

export interface AppLayerRowProps {
  readonly kind: AppLayerKind;
  readonly name: string;
  readonly meta: string;
  readonly selected?: boolean;
  readonly visible?: boolean;
  readonly onSelect?: () => void;
  readonly onToggleVisible?: () => void;
  readonly className?: string;
}

const THUMB: Record<AppLayerKind, { className: string; glyph: string }> = {
  text: { className: 'bg-paper-warm text-ink', glyph: 'T' },
  image: { className: 'bg-blue text-white', glyph: '⬚' },
  ai: { className: 'bg-blue text-white', glyph: '✦' },
};

export function AppLayerRow({
  kind,
  name,
  meta,
  selected = false,
  visible = true,
  onSelect,
  onToggleVisible,
  className,
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
    >
      <span className="font-mono text-sm text-ink-3">⠿</span>
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
      <button
        type="button"
        aria-label={visible ? 'Hide layer' : 'Show layer'}
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisible?.();
        }}
        className={cn('text-[15px]', visible ? 'text-ink' : 'text-ink-4')}
      >
        {visible ? '●' : '◌'}
      </button>
    </div>
  );
}
