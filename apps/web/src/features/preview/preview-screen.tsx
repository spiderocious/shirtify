import { useState } from 'react';

import { Repeat } from 'meemaw';

import { PREVIEW_PARTS, type PreviewGroup } from './preview-registry.tsx';

const GROUPS: readonly PreviewGroup[] = ['Primitives', 'Display', 'Overlays'];

// The Shirtify design-system viewer. A flyer-framed sidebar of every component
// + the live part on the right. The designer reviews here.
export function PreviewScreen() {
  const [activeId, setActiveId] = useState<string>(PREVIEW_PARTS[0]?.id ?? '');
  const active = PREVIEW_PARTS.find((p) => p.id === activeId) ?? PREVIEW_PARTS[0];
  const ActivePart = active?.Part;

  return (
    <div className="grid h-screen grid-cols-[260px_1fr] bg-paper-deep">
      <aside className="flex flex-col overflow-auto border-r-3 border-ink bg-paper px-5 py-6">
        <div className="flex items-center gap-2.5">
          <span className="-rotate-3 border-2.5 border-ink bg-lime px-2 py-1 font-display text-base text-lime-ink">
            S
          </span>
          <h1 className="font-display text-xl tracking-tight">Shirtify</h1>
        </div>
        <div className="mt-2 font-mono text-[10px] leading-relaxed text-ink-3">
          Component library · neobrutalist-pop
        </div>

        <nav className="mt-6 flex flex-col gap-5">
          <Repeat each={[...GROUPS]}>
            {(group) => (
              <div>
                <div className="mb-2 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em]">
                  <span className="bg-ink px-1.5 py-0.5 text-paper">{group}</span>
                  <span className="h-0.5 flex-1 bg-ink" />
                </div>
                <Repeat each={PREVIEW_PARTS.filter((p) => p.group === group)}>
                  {(part) => (
                    <button
                      type="button"
                      onClick={() => setActiveId(part.id)}
                      className={[
                        'flex w-full items-center gap-2.5 border-2 px-2 py-1.5 text-left font-sans text-[13px]',
                        part.id === activeId
                          ? 'border-ink bg-lime font-bold text-ink'
                          : 'border-transparent font-medium text-ink-2 hover:text-ink',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'h-1.5 w-1.5 border-2',
                          part.id === activeId ? 'border-ink bg-ink' : 'border-ink-4',
                        ].join(' ')}
                      />
                      {part.label}
                    </button>
                  )}
                </Repeat>
              </div>
            )}
          </Repeat>
        </nav>
      </aside>

      <main className="overflow-auto px-10 py-9">
        {ActivePart ? <ActivePart /> : null}
      </main>
    </div>
  );
}
