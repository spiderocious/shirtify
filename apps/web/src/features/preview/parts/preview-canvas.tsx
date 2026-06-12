import { type ReactNode } from 'react';

// Shared scaffolding for the Shirtify design-system viewer. Every component
// part renders inside <Section> blocks with labelled <ComponentRow>s — the
// designer reviews the live library here, not in a PR.

export interface SectionProps {
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
}

export function Section({ title, description, children }: SectionProps) {
  return (
    <section className="mb-12">
      <div className="mb-5 flex items-center gap-3 border-b-3 border-ink pb-3">
        <h2 className="font-display text-2xl leading-none tracking-tight">{title}</h2>
      </div>
      {description ? (
        <p className="mb-6 max-w-[64ch] font-sans text-sm leading-relaxed text-ink-2">
          {description}
        </p>
      ) : null}
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

export interface ComponentRowProps {
  readonly label?: string;
  readonly children: ReactNode;
}

export function ComponentRow({ label, children }: ComponentRowProps) {
  return (
    <div>
      {label ? (
        <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink-3">
          {label}
        </div>
      ) : null}
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </div>
  );
}

// A bone-paper stage to show a component in its natural ground.
export function Stage({ children }: { readonly children: ReactNode }) {
  return (
    <div className="border-3 border-ink bg-paper-deep p-6 shadow-pop-sm">{children}</div>
  );
}

// The halftone dark zone (shirt-canvas ground / AI panel) for previews that
// need it. Matches the .shirtify-halftone utility in @repo/ui/styles.css.
export function HalftoneStage({ children }: { readonly children: ReactNode }) {
  return (
    <div className="shirtify-halftone flex min-h-[160px] items-center justify-center border-3 border-ink p-6 shadow-pop">
      {children}
    </div>
  );
}
