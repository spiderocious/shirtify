import { forwardRef, type SelectHTMLAttributes } from 'react';

import { cn } from '../../utils/cn.ts';

/**
 * Shirtify select — stance #28 Neobrutalist pop.
 * Visual spec: design-system/projects/shirtify/preview/11-inputs.html (.sel)
 *
 * Same outlined-well skin as AppInput, native arrow suppressed and replaced
 * with a square-cap ink chevron.
 */
export interface AppSelectOption {
  readonly label: string;
  readonly value: string;
}

export interface AppSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: readonly AppSelectOption[];
  invalid?: boolean;
}

const CHEVRON =
  "bg-[url(\"data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='12'%20height='8'%20viewBox='0%200%2012%208'%3E%3Cpath%20d='M1%201l5%205%205-5'%20stroke='%2316140F'%20stroke-width='2.4'%20fill='none'%20stroke-linecap='square'/%3E%3C/svg%3E\")] bg-[length:12px] bg-[right_13px_center] bg-no-repeat";

export const AppSelect = forwardRef<HTMLSelectElement, AppSelectProps>(function AppSelect(
  { options, invalid = false, className, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        'w-full cursor-pointer appearance-none border-3 border-ink bg-paper-warm py-[11px] pl-[13px] pr-9',
        'font-sans text-sm text-ink outline-none focus:shadow-[0_0_0_4px_rgba(31,107,255,0.22)]',
        CHEVRON,
        invalid && 'border-crit',
        className,
      )}
      {...rest}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
});
