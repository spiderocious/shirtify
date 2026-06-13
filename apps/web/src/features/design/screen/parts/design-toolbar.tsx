import { AppToolBar, type AppTool } from '@shirtify/ui';

import { useDesign } from '../../providers/design-provider.tsx';
import { type ToolId } from './tool-panel.tsx';

const TOOLS: readonly AppTool[] = [
  { id: 'text', label: 'Text', glyph: 'T' },
  { id: 'image', label: 'Image', glyph: '⬚' },
  { id: 'shapes', label: 'Shapes', glyph: '★' },
  { id: 'filters', label: 'Filters', glyph: '◑' },
  { id: 'colour', label: 'Colour', glyph: '⬤' },
];

/** Bottom-pinned tool dock. Selecting Text immediately adds a text layer. */
export function DesignToolbar({
  tool,
  onToolChange,
  onDone,
}: {
  tool: ToolId;
  onToolChange: (tool: ToolId) => void;
  onDone: () => void;
}) {
  const { addTextLayer } = useDesign();

  const select = (id: string) => {
    if (id === 'text') {
      addTextLayer();
      onToolChange('text');
      return;
    }
    onToolChange(id as ToolId);
  };

  return (
    <AppToolBar
      tools={TOOLS}
      activeToolId={tool ?? undefined}
      onToolSelect={select}
      doneLabel="Done"
      onDone={onDone}
    />
  );
}
