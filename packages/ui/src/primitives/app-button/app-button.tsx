import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '../../utils/cn.js';

export type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AppButtonVariant;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

// Tokens mirror packages/ui/src/theme/index.ts (brand / accent). Kept as
// classes here so the primitive stays usable without a Tailwind theme merge.
const VARIANT_CLASSES: Record<AppButtonVariant, string> = {
  primary:
    'bg-[#1e3a8a] text-white hover:bg-[#1d4ed8] focus-visible:ring-[#1d4ed8] disabled:opacity-60',
  secondary:
    'bg-[#f1f5f9] text-[#1e3a8a] hover:bg-[#e2e8f0] focus-visible:ring-[#1e3a8a] disabled:opacity-60',
  ghost:
    'bg-transparent text-[#1e3a8a] hover:bg-[#1e3a8a]/5 focus-visible:ring-[#1e3a8a] disabled:opacity-60',
  danger:
    'bg-[#ea580c] text-white hover:bg-[#c2410c] focus-visible:ring-[#ea580c] disabled:opacity-60',
};

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(function AppButton(
  { variant = 'primary', className, loading, leadingIcon, trailingIcon, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2',
        'text-sm font-medium transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...rest}
    >
      {leadingIcon ? <span className="-ml-0.5">{leadingIcon}</span> : null}
      <span>{loading ? 'Loading…' : children}</span>
      {trailingIcon ? <span className="-mr-0.5">{trailingIcon}</span> : null}
    </button>
  );
});
