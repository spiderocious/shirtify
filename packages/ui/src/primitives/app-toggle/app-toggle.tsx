import { cn } from '../../utils/cn.ts';

/**
 * Shirtify toggle — stance #28 Neobrutalist pop.
 * Visual spec: design-system/projects/shirtify/preview/12-controls.html (.tog)
 *
 * A hard switch: outlined track, square ink thumb that slides and fills lime
 * when on. Controlled — pass `checked` + `onChange`.
 */
export interface AppToggleProps {
  readonly checked: boolean;
  readonly onChange: (next: boolean) => void;
  readonly disabled?: boolean;
  readonly label?: string;
  readonly className?: string;
}

export function AppToggle({ checked, onChange, disabled = false, label, className }: AppToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-7 w-[50px] shrink-0 border-2.5 border-ink transition-colors',
        checked ? 'bg-lime' : 'bg-paper-warm',
        disabled && 'cursor-not-allowed opacity-45',
        className,
      )}
    >
      <span
        className={cn(
          'absolute left-0.5 top-0.5 h-[18px] w-[18px] bg-ink transition-transform duration-[110ms] ease-[cubic-bezier(0.2,0.9,0.3,1.2)]',
          checked && 'translate-x-[22px]',
        )}
      />
    </button>
  );
}
