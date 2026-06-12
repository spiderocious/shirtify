import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '../../utils/cn.ts';

/**
 * Shirtify button — stance #28 Neobrutalist pop.
 * Visual spec: design-system/projects/shirtify/preview/10-buttons.html
 * Tokens:      design-system/projects/shirtify/preview/_foundation.css (.b, :207-)
 *
 * The signature interaction: a fat-outlined button on a hard offset shadow that
 * COLLAPSES on press — it translates by its shadow's offset so it lands flat.
 * Five jobs: primary (lime/GO), ai (blue/magic), secondary, ghost, danger
 * (ghost crimson, the one irreversible action — fills on hover).
 */
export type AppButtonVariant = 'primary' | 'ai' | 'secondary' | 'ghost' | 'danger';
export type AppButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  loading?: boolean;
  block?: boolean;
  iconOnly?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const BASE =
  'inline-flex items-center justify-center gap-2 border-3 border-ink font-heavy font-extrabold ' +
  'transition-[transform,box-shadow,background-color] duration-[60ms] ease-out ' +
  'focus:outline-none focus-visible:ring-4 focus-visible:ring-blue/30 ' +
  'disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 ' +
  '[-webkit-tap-highlight-color:transparent]';

// Each variant carries its rest + press state. The press translates the button
// onto its own shadow (shadow → 0). Danger uses a crimson shadow + ghost fill.
const VARIANT: Record<AppButtonVariant, string> = {
  primary:
    'bg-lime text-lime-ink shadow-pop hover:bg-lime-deep active:translate-x-1 active:translate-y-1 active:shadow-none',
  ai: 'bg-blue text-white shadow-pop hover:bg-blue-deep active:translate-x-1 active:translate-y-1 active:shadow-none',
  secondary:
    'bg-paper-warm text-ink shadow-pop hover:bg-paper-deep active:translate-x-1 active:translate-y-1 active:shadow-none',
  ghost: 'border-ink bg-transparent text-ink shadow-none active:translate-y-px',
  danger:
    'border-crit bg-transparent text-crit shadow-pop-crit hover:bg-crit hover:text-white active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
};

const SIZE: Record<AppButtonSize, string> = {
  sm: 'px-[11px] py-[7px] text-xs shadow-pop-sm active:translate-x-[3px] active:translate-y-[3px]',
  md: 'px-4 py-[11px] text-sm',
  lg: 'px-[22px] py-[14px] text-base shadow-pop-lg active:translate-x-1.5 active:translate-y-1.5',
};

const ICON_ONLY: Record<AppButtonSize, string> = {
  sm: 'h-9 w-9 p-0',
  md: 'h-11 w-11 p-0',
  lg: 'h-[52px] w-[52px] p-0',
};

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(function AppButton(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    block = false,
    iconOnly = false,
    leadingIcon,
    trailingIcon,
    className,
    children,
    disabled,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled === true || loading}
      className={cn(
        BASE,
        VARIANT[variant],
        SIZE[size],
        iconOnly && ICON_ONLY[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {leadingIcon ? <span className="-ml-0.5 inline-flex">{leadingIcon}</span> : null}
      {iconOnly ? children : <span>{loading ? 'Loading…' : children}</span>}
      {trailingIcon ? <span className="-mr-0.5 inline-flex">{trailingIcon}</span> : null}
    </button>
  );
});
