import { type ReactNode } from 'react';

import { cn } from '../../utils/cn.ts';

/**
 * Shirtify stat card — stance #28 Neobrutalist pop.
 * Visual spec: design-system/projects/shirtify/preview/24-cards.html (.stat)
 *
 * A fat-outlined box with a loud Archivo Black number — the one place size
 * shouts. `tone` tints the value (e.g. tomato for "need a nudge"); `accent`
 * swaps the box shadow to match.
 */
export interface AppStatProps {
  readonly label: string;
  readonly value: ReactNode;
  readonly tone?: 'ink' | 'lime' | 'tomato';
  readonly mono?: boolean;
  readonly className?: string;
}

const VALUE_TONE = {
  ink: 'text-ink',
  lime: 'text-lime-ink',
  tomato: 'text-tomato',
} as const;

export function AppStat({ label, value, tone = 'ink', mono = false, className }: AppStatProps) {
  return (
    <div
      className={cn(
        'border-3 border-ink bg-paper-warm px-5 py-[18px]',
        tone === 'tomato' ? 'shadow-pop-tomato' : 'shadow-pop',
        className,
      )}
    >
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink-3">
        {label}
      </div>
      <div
        className={cn(
          'mt-2 leading-[0.92] tracking-tight',
          mono ? 'font-mono text-[22px] font-bold tabular-nums' : 'font-display text-[32px]',
          VALUE_TONE[tone],
        )}
      >
        {value}
      </div>
    </div>
  );
}
