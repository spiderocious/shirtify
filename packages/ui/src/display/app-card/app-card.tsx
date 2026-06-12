import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '../../utils/cn.ts';

/**
 * Shirtify box & card — stance #28 Neobrutalist pop.
 * Visual spec: design-system/projects/shirtify/preview/24-cards.html
 *
 * One card idiom — a fat-outlined box on a hard offset shadow. AppBox is the
 * raw container; AppCard adds a labelled header strip (lime or ink) and an
 * optional press-to-collapse interaction for clickable cards.
 */
export interface AppBoxProps extends HTMLAttributes<HTMLDivElement> {
  shadow?: 'sm' | 'md' | 'lg' | 'none';
  padded?: boolean;
}

const SHADOW = {
  sm: 'shadow-pop-sm',
  md: 'shadow-pop',
  lg: 'shadow-pop-lg',
  none: 'shadow-none',
} as const;

export const AppBox = forwardRef<HTMLDivElement, AppBoxProps>(function AppBox(
  { shadow = 'md', padded = false, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('border-3 border-ink bg-paper-warm', SHADOW[shadow], padded && 'p-6', className)}
      {...rest}
    >
      {children}
    </div>
  );
});

export interface AppCardProps extends HTMLAttributes<HTMLDivElement> {
  headerLabel?: ReactNode;
  headerRight?: ReactNode;
  headerTone?: 'lime' | 'ink';
  pressable?: boolean;
}

export const AppCard = forwardRef<HTMLDivElement, AppCardProps>(function AppCard(
  { headerLabel, headerRight, headerTone = 'lime', pressable = false, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'border-3 border-ink bg-paper-warm shadow-pop',
        pressable &&
          'cursor-pointer transition-[transform,box-shadow] duration-[60ms] active:translate-x-1 active:translate-y-1 active:shadow-none',
        className,
      )}
      {...rest}
    >
      {headerLabel ? (
        <div
          className={cn(
            'flex items-center justify-between border-b-3 border-ink px-[13px] py-2',
            'font-mono text-[10px] font-bold uppercase tracking-[0.12em]',
            headerTone === 'lime' ? 'bg-lime text-lime-ink' : 'bg-ink text-paper',
          )}
        >
          <span>{headerLabel}</span>
          {headerRight ? <span>{headerRight}</span> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
});
