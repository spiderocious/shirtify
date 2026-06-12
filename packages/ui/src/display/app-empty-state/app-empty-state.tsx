import { type ReactNode } from 'react';

import { cn } from '../../utils/cn.ts';

/**
 * Shirtify empty & loading — stance #28 Neobrutalist pop.
 * Visual spec: design-system/projects/shirtify/preview/25-empty-loading.html
 *
 * Empty states use a DASHED fat outline (an empty slot, waiting) and always
 * point at the next action. Skeletons are hard-edged boxes with a single
 * sweep — no spinners, no glass.
 */
export interface AppEmptyStateProps {
  readonly glyph?: ReactNode;
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
  readonly className?: string;
}

export function AppEmptyState({ glyph = '⬚', title, description, action, className }: AppEmptyStateProps) {
  return (
    <div
      className={cn(
        'border-3 border-dashed border-ink bg-paper-warm px-7 py-10 text-center',
        className,
      )}
    >
      <span className="inline-block -rotate-[5deg] font-display text-[44px] text-ink">{glyph}</span>
      <h3 className="mb-1.5 mt-3.5 font-display text-[22px]">{title}</h3>
      {description ? (
        <p className="mx-auto mb-[18px] max-w-[34ch] font-sans text-sm leading-relaxed text-ink-2">
          {description}
        </p>
      ) : null}
      {action ? <div className="flex justify-center gap-3">{action}</div> : null}
    </div>
  );
}

export interface AppSkeletonProps {
  readonly className?: string;
}

/** A hard-edged skeleton block with a single sweep. Size it via className. */
export function AppSkeleton({ className }: AppSkeletonProps) {
  return (
    <span
      className={cn(
        'shirtify-skeleton relative block overflow-hidden border-2.5 border-ink bg-paper-deep',
        className,
      )}
    />
  );
}
