import { useState } from 'react';

import { AppToolBar, type AppTool } from '@shirtify/ui';

import { Section, ComponentRow } from './preview-canvas.tsx';

const TOOLS: readonly AppTool[] = [
  { id: 'text', label: 'Text', glyph: 'T' },
  { id: 'image', label: 'Image', glyph: '⬚' },
  { id: 'ai', label: 'AI', glyph: '✦', ai: true },
  { id: 'colour', label: 'Colour', glyph: '◐' },
];

export function ToolBarPart() {
  const [active, setActive] = useState('ai');

  return (
    <Section
      title="Tool bar"
      description="The most-touched component on the customer side — four tools + Done, thumb-reachable. The active tool fills lime; the AI tool fills blue. Done is always widest, always lime."
    >
      <ComponentRow label="Interactive (tap a tool)">
        <div className="w-[560px]">
          <AppToolBar
            tools={TOOLS}
            activeToolId={active}
            onToolSelect={setActive}
            doneLabel="Done"
            onDone={() => undefined}
          />
        </div>
      </ComponentRow>
    </Section>
  );
}
