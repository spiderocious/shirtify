import { type ReactNode } from 'react';

import { cn } from '../../utils/cn.ts';

/**
 * Shirtify chip — stance #28 Neobrutalist pop.
 * Visual spec: design-system/projects/shirtify/preview/23-pills.html (.chip)
 *
 * A looser tag for content (shirt type/colour, counts). Sans, 2px radius —
 * the one place geometry softens slightly.
 */
export interface AppChipProps {
  readonly className?: string;
  readonly children: ReactNode;
}

export function AppChip({ className, children }: AppChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border-2.5 border-ink bg-paper-warm px-2 py-[3px]',
        'font-sans text-xs font-semibold text-ink',
        className,
      )}
    >
      {children}
    </span>
  );
}
