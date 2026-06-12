import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react';

import { cn } from '../../utils/cn.ts';

/**
 * Shirtify inputs — stance #28 Neobrutalist pop.
 * Visual spec: design-system/projects/shirtify/preview/11-inputs.html
 * Tokens:      _foundation.css (.f, .f-label)
 *
 * An input is an outlined WELL with a faint inset shadow — a slot you drop
 * content into. On focus it drops a blue ring (the AI accent, so "active"
 * reads consistently). `mono` switches to JetBrains Mono for money/record.
 */
const WELL_BASE =
  'w-full border-3 border-ink bg-paper-warm px-[13px] py-[11px] font-sans text-sm text-ink ' +
  'shadow-[inset_3px_3px_0_rgba(22,20,15,0.05)] outline-none transition-shadow ' +
  'placeholder:text-ink-4 focus:shadow-[0_0_0_4px_rgba(31,107,255,0.22)]';

const WELL_ERROR = 'border-crit shadow-[inset_3px_3px_0_var(--crit-tint)]';

export interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean;
  invalid?: boolean;
}

export const AppInput = forwardRef<HTMLInputElement, AppInputProps>(function AppInput(
  { mono = false, invalid = false, className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(WELL_BASE, mono && 'font-mono tabular-nums', invalid && WELL_ERROR, className)}
      {...rest}
    />
  );
});

export interface AppTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  mono?: boolean;
  invalid?: boolean;
}

export const AppTextarea = forwardRef<HTMLTextAreaElement, AppTextareaProps>(function AppTextarea(
  { mono = false, invalid = false, className, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        WELL_BASE,
        'resize-y',
        mono && 'font-mono tabular-nums',
        invalid && WELL_ERROR,
        className,
      )}
      {...rest}
    />
  );
});

/**
 * A field wrapper: mono overline label + input slot + error/hint line.
 * Pass the control as children (AppInput / AppTextarea / AppSelect).
 */
export interface AppFieldProps {
  readonly label?: string;
  readonly error?: string;
  readonly hint?: string;
  readonly htmlFor?: string;
  readonly className?: string;
  readonly children: ReactNode;
}

export function AppField({ label, error, hint, htmlFor, className, children }: AppFieldProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className="mb-[7px] block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink"
        >
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <span className="mt-1.5 font-mono text-[11px] text-crit">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 font-mono text-[11px] text-ink-3">{hint}</span>
      ) : null}
    </div>
  );
}
