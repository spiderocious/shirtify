import {
  searchIcons,
  searchEmojis,
  type IconDef,
  type GraphicNode,
} from '@shirtify/core';
import { AppText, DrawerService } from '@shirtify/ui';
import { createElement, useMemo, useState } from 'react';

/** Render a lucide icon's nodes as an inline SVG preview (monoline). */
function IconSvg({ icon, size = 28 }: { icon: IconDef; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${icon.viewBox} ${icon.viewBox}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icon.nodes.map((node: GraphicNode, i) =>
        createElement(node[0], { key: i, ...(node[1] as Record<string, string | number>) }),
      )}
    </svg>
  );
}

type Tab = 'icons' | 'emoji';

function GraphicSelectorBody({
  onPickIcon,
  onPickEmoji,
}: {
  onPickIcon: (icon: IconDef) => void;
  onPickEmoji: (emoji: string) => void;
}) {
  const [tab, setTab] = useState<Tab>('icons');
  const [query, setQuery] = useState('');

  const icons = useMemo(() => searchIcons(query), [query]);
  const emojis = useMemo(() => searchEmojis(query), [query]);

  return (
    <div className="flex max-h-[80vh] w-[min(94vw,560px)] flex-col border-3 border-ink bg-paper shadow-pop-lg">
      <div className="flex items-center gap-2 border-b-3 border-ink bg-lime px-4 py-3">
        <AppText variant="display-3" as="span" className="!text-lime-ink">
          Add a graphic
        </AppText>
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4">
        {/* tabs */}
        <div className="mb-3 flex gap-1.5">
          {(['icons', 'emoji'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`border-2.5 border-ink px-3 py-1.5 font-mono text-[11px] font-bold uppercase ${
                tab === t ? 'bg-lime text-lime-ink' : 'bg-paper-warm text-ink'
              }`}
            >
              {t === 'icons' ? 'Icons' : 'Emoji'}
            </button>
          ))}
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search — city, heart, music, star, party…"
          className="mb-3 w-full border-3 border-ink bg-paper-warm px-3 py-2 font-sans text-sm outline-none focus:shadow-[0_0_0_4px_rgba(31,107,255,0.22)]"
        />

        {tab === 'icons' ? (
          <div className="grid flex-1 grid-cols-5 gap-2 overflow-y-auto pr-1 sm:grid-cols-6">
            {icons.map((icon) => (
              <button
                key={icon.id}
                type="button"
                title={icon.label}
                onClick={() => onPickIcon(icon)}
                className="flex aspect-square items-center justify-center border-2.5 border-ink bg-paper-warm text-ink hover:bg-go-tint"
              >
                <IconSvg icon={icon} />
              </button>
            ))}
          </div>
        ) : (
          <div className="grid flex-1 grid-cols-6 gap-2 overflow-y-auto pr-1 sm:grid-cols-8">
            {emojis.map((e) => (
              <button
                key={e.char}
                type="button"
                onClick={() => onPickEmoji(e.char)}
                className="flex aspect-square items-center justify-center border-2.5 border-ink bg-paper-warm text-2xl hover:bg-go-tint"
              >
                {e.char}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Open the graphic selector (icons + emoji). Picking applies + closes. */
export function openGraphicSelector(opts: {
  onPickIcon: (icon: IconDef) => void;
  onPickEmoji: (emoji: string) => void;
}): void {
  DrawerService.openModal(
    <GraphicSelectorBody
      onPickIcon={(icon) => {
        opts.onPickIcon(icon);
        DrawerService.closeModal();
      }}
      onPickEmoji={(emoji) => {
        opts.onPickEmoji(emoji);
        DrawerService.closeModal();
      }}
    />,
    { bare: true, closeOnOutsideClick: true, closeOnEscape: true },
  );
}
