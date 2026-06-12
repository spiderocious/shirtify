import { type ReactNode } from 'react';

import { cn } from '../../utils/cn.ts';

/**
 * Shirtify tool bar — stance #28 Neobrutalist pop.
 * Visual spec: design-system/projects/shirtify/preview/13-toolbar.html
 *
 * The most-touched component on the customer side: a bottom-pinned bar of tools
 * plus the primary Done. The active tool fills lime (the AI tool fills blue);
 * Done is always the widest, always lime, always thumb-reachable. Controlled
 * via `activeToolId`.
 */
export interface AppTool {
  readonly id: string;
  readonly label: string;
  readonly glyph: ReactNode;
  /** The AI tool fills blue when active instead of lime. */
  readonly ai?: boolean;
}

export interface AppToolBarProps {
  readonly tools: readonly AppTool[];
  readonly activeToolId?: string;
  readonly onToolSelect: (id: string) => void;
  readonly doneLabel?: string;
  readonly onDone: () => void;
  readonly className?: string;
}

export function AppToolBar({
  tools,
  activeToolId,
  onToolSelect,
  doneLabel = 'Done',
  onDone,
  className,
}: AppToolBarProps) {
  return (
    <div className={cn('flex items-stretch border-3 border-ink bg-paper-warm shadow-pop', className)}>
      {tools.map((tool) => {
        const active = tool.id === activeToolId;
        return (
          <button
            key={tool.id}
            type="button"
            onClick={() => onToolSelect(tool.id)}
            className={cn(
              'flex flex-1 flex-col items-center gap-1.5 border-r-2.5 border-ink px-2 py-3 font-heavy text-xs font-bold',
              tool.ai ? 'text-blue' : 'text-ink',
              active && (tool.ai ? 'bg-blue text-white' : 'bg-lime text-lime-ink'),
            )}
          >
            <span className="text-[22px] leading-none">{tool.glyph}</span>
            {tool.label}
          </button>
        );
      })}
      <button
        type="button"
        onClick={onDone}
        className="flex flex-[1.6] flex-col items-center gap-1.5 bg-lime px-2 py-3 font-heavy text-xs font-bold text-lime-ink"
      >
        <span className="text-base leading-none">✓</span>
        {doneLabel}
      </button>
    </div>
  );
}
