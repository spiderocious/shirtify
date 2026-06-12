import { cn } from '../../utils/cn.ts';

/**
 * Shirtify curated pickers — stance #28 Neobrutalist pop.
 * Visual spec: design-system/projects/shirtify/preview/12-controls.html
 *
 * Curated, NOT freeform — a controlled font/colour set that always prints
 * clean. Fewer choices, better shirts. Both are controlled (value + onChange).
 */

export interface AppFontOption {
  readonly id: string;
  readonly label: string;
  /** CSS font-family applied to the sample glyph. */
  readonly fontFamily: string;
}

export interface AppFontPickerProps {
  readonly fonts: readonly AppFontOption[];
  readonly value: string;
  readonly onChange: (id: string) => void;
  readonly className?: string;
}

export function AppFontPicker({ fonts, value, onChange, className }: AppFontPickerProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-2', className)}>
      {fonts.map((font) => {
        const active = font.id === value;
        return (
          <button
            key={font.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(font.id)}
            className={cn(
              'border-2.5 border-ink p-2.5 text-center',
              active ? 'bg-lime shadow-pop-sm' : 'bg-paper-warm',
            )}
          >
            <span className="block text-lg text-ink" style={{ fontFamily: font.fontFamily }}>
              Aa
            </span>
            <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">
              {font.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export interface AppColourSwatchesProps {
  readonly colours: readonly string[];
  readonly value: string;
  readonly onChange: (hex: string) => void;
  readonly className?: string;
}

export function AppColourSwatches({ colours, value, onChange, className }: AppColourSwatchesProps) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {colours.map((hex) => {
        const active = hex.toLowerCase() === value.toLowerCase();
        return (
          <button
            key={hex}
            type="button"
            aria-label={hex}
            aria-pressed={active}
            onClick={() => onChange(hex)}
            className={cn(
              'h-[38px] w-[38px] border-2.5 border-ink',
              active && 'shadow-[0_0_0_3px_var(--paper-warm),0_0_0_5.5px_var(--ink)]',
            )}
            style={{ background: hex }}
          />
        );
      })}
    </div>
  );
}
