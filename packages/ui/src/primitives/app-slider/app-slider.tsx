import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '../../utils/cn.ts';

/**
 * Shirtify slider — stance #28 Neobrutalist pop.
 * Visual spec: design-system/projects/shirtify/preview/12-controls.html (.rng)
 *
 * Chunky outlined track with a square lime thumb. Used for stroke width,
 * scale, and rotation on a layer. The thumb styling lives in the global
 * `shirtify-rng` rule (styles.css) since pseudo-elements can't be Tailwind'd.
 */
// value / min / max / step / onChange all come from the native range input.
export type AppSliderProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const AppSlider = forwardRef<HTMLInputElement, AppSliderProps>(function AppSlider(
  { className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      type="range"
      className={cn('shirtify-rng h-2.5 w-full cursor-pointer border-2.5 border-ink bg-paper-warm', className)}
      {...rest}
    />
  );
});
