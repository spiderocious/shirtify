import { cn } from '../../utils/cn.ts';

/**
 * Shirtify avatar — stance #28 Neobrutalist pop.
 * Visual spec: design-system/projects/shirtify/preview/23-pills.html (.av)
 *
 * Initials only, hard square with a 2px radius (the one place geometry
 * softens). Tinted to role: lime default customer, blue AI-assisted, paper
 * the seller.
 */
export type AppAvatarTone = 'lime' | 'blue' | 'paper';
export type AppAvatarSize = 'sm' | 'md' | 'lg';

export interface AppAvatarProps {
  readonly initials: string;
  readonly tone?: AppAvatarTone;
  readonly size?: AppAvatarSize;
  readonly className?: string;
}

const TONE: Record<AppAvatarTone, string> = {
  lime: 'bg-lime text-lime-ink',
  blue: 'bg-blue text-white',
  paper: 'bg-paper-warm text-ink',
};

const SIZE: Record<AppAvatarSize, string> = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-[38px] w-[38px] text-[13px]',
  lg: 'h-[52px] w-[52px] text-lg',
};

export function AppAvatar({ initials, tone = 'lime', size = 'md', className }: AppAvatarProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-sm border-2.5 border-ink font-heavy font-extrabold',
        TONE[tone],
        SIZE[size],
        className,
      )}
    >
      {initials}
    </span>
  );
}
