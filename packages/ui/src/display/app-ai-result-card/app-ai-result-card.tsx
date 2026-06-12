import { type ReactNode } from 'react';

import { cn } from '../../utils/cn.ts';

/**
 * Shirtify AI result card — stance #28 Neobrutalist pop.
 * Visual spec: design-system/projects/shirtify/preview/22-ai-cards.html
 *
 * One of the three options the AI returns. Tapping it drops the design onto the
 * shirt as a layer; the picked card lifts onto a BLUE shadow (AI's colour).
 * The artwork is passed as `preview` (consumer renders it) — the library never
 * hardcodes a mockup. `loading` shows the generating skeleton.
 */
export interface AppAiResultCardProps {
  readonly index: number;
  readonly label: string;
  readonly preview?: ReactNode;
  readonly picked?: boolean;
  readonly loading?: boolean;
  readonly hint?: string;
  readonly onPick?: () => void;
  readonly className?: string;
}

export function AppAiResultCard({
  index,
  label,
  preview,
  picked = false,
  loading = false,
  hint = 'tap to place',
  onPick,
  className,
}: AppAiResultCardProps) {
  const tag = String(index).padStart(2, '0');
  return (
    <button
      type="button"
      onClick={onPick}
      disabled={loading}
      className={cn(
        'border-2.5 border-ink bg-paper-warm text-left transition-[transform,box-shadow] duration-[60ms]',
        picked ? 'shadow-pop-blue' : 'shadow-pop-sm',
        !loading && 'active:translate-x-1 active:translate-y-1 active:shadow-none',
        className,
      )}
    >
      <div className="relative flex h-[92px] items-center justify-center border-b-2.5 border-ink">
        <span className="absolute left-1.5 top-1.5 bg-ink px-1.5 py-px font-mono text-[9px] font-bold text-white">
          {picked ? `${tag} ✓` : tag}
        </span>
        {loading ? (
          <span className="font-mono text-xs text-ink-3">✦ generating…</span>
        ) : (
          preview
        )}
      </div>
      <div
        className={cn(
          'flex items-center justify-between px-[9px] py-[7px] font-heavy text-[11px] font-bold',
          picked && 'bg-blue text-white',
        )}
      >
        <span>{picked ? 'Picked' : label}</span>
        <span className={cn('font-mono', !picked && 'text-ink-3')}>{picked ? 'placing' : hint}</span>
      </div>
    </button>
  );
}
