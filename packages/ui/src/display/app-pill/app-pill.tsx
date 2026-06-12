import { type ReactNode } from 'react';

import { cn } from '../../utils/cn.ts';

/**
 * Shirtify pill — stance #28 Neobrutalist pop.
 * Visual spec: design-system/projects/shirtify/preview/23-pills.html (.pill)
 *
 * Mono, uppercase, fat-outlined — never a soft tinted blob. Each tone means
 * exactly one thing: go (lime), ai (blue), warn (tomato), ink (submitted).
 * Status colour never carries meaning alone — there's always a word.
 */
export type AppPillTone = 'default' | 'go' | 'ai' | 'warn' | 'ink';

export interface AppPillProps {
  readonly tone?: AppPillTone;
  readonly dot?: boolean;
  readonly className?: string;
  readonly children: ReactNode;
}

const TONE: Record<AppPillTone, string> = {
  default: 'bg-paper-warm text-ink',
  go: 'bg-lime text-lime-ink',
  ai: 'bg-blue text-white',
  warn: 'bg-tomato text-white',
  ink: 'bg-ink text-paper',
};

export function AppPill({ tone = 'default', dot = false, className, children }: AppPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border-2 border-ink px-2 py-[3px]',
        'font-mono text-[11px] font-bold uppercase tracking-[0.02em] whitespace-nowrap',
        TONE[tone],
        className,
      )}
    >
      {dot ? <span className="h-[7px] w-[7px] rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}
