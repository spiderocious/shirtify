import { type HTMLAttributes, type ElementType, type ReactNode } from 'react';

import { cn } from '../../utils/cn.ts';

/**
 * Shirtify type — stance #28 Neobrutalist pop.
 * Visual spec: design-system/projects/shirtify/preview/02-type.html
 *
 * Three families, three jobs: Archivo Black shouts (display, big numbers),
 * Space Grotesk works (chrome, body), JetBrains Mono keeps the record (IDs,
 * naira, coordinates, sizes, DPI — always tabular). No serif: this is not a
 * reading product.
 */
export type AppTextVariant =
  | 'display-1'
  | 'display-2'
  | 'display-3'
  | 'heading'
  | 'body'
  | 'body-sm'
  | 'mono'
  | 'overline';

export interface AppTextProps extends HTMLAttributes<HTMLElement> {
  variant?: AppTextVariant;
  as?: ElementType;
  children?: ReactNode;
}

const VARIANT_CLASSES: Record<AppTextVariant, string> = {
  'display-1': 'font-display text-5xl leading-none tracking-tight',
  'display-2': 'font-display text-4xl leading-none tracking-tight',
  'display-3': 'font-display text-2xl leading-tight tracking-tight',
  heading: 'font-heavy text-xl font-bold leading-snug',
  body: 'font-sans text-base leading-relaxed text-ink-2',
  'body-sm': 'font-sans text-sm leading-relaxed text-ink-2',
  mono: 'font-mono text-sm tabular-nums text-ink-3',
  overline:
    'font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink-3',
};

const DEFAULT_ELEMENT: Record<AppTextVariant, ElementType> = {
  'display-1': 'h1',
  'display-2': 'h1',
  'display-3': 'h2',
  heading: 'h3',
  body: 'p',
  'body-sm': 'p',
  mono: 'span',
  overline: 'span',
};

export function AppText({ variant = 'body', as, className, children, ...rest }: AppTextProps) {
  const Component = as ?? DEFAULT_ELEMENT[variant];
  return (
    <Component className={cn(VARIANT_CLASSES[variant], className)} {...rest}>
      {children}
    </Component>
  );
}
