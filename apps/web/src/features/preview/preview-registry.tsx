import { type ComponentType } from 'react';

// The viewer registry. Each component gets ONE part the moment it's built
// (translation-guide §0.2 — never batch). Order here = order in the nav.
// Groups: Foundation · Primitives · Display · Overlays.

export type PreviewGroup = 'Foundation' | 'Primitives' | 'Display' | 'Overlays';

export interface PreviewPart {
  readonly id: string;
  readonly label: string;
  readonly group: PreviewGroup;
  readonly Part: ComponentType;
}

import { ButtonPart } from './parts/button-part.tsx';
import { TextPart } from './parts/text-part.tsx';
import { FieldPart } from './parts/field-part.tsx';
import { SelectPart } from './parts/select-part.tsx';
import { TogglePart } from './parts/toggle-part.tsx';
import { SliderPart } from './parts/slider-part.tsx';
import { PickersPart } from './parts/pickers-part.tsx';
import { ToolBarPart } from './parts/tool-bar-part.tsx';
import { PillPart } from './parts/pill-part.tsx';
import { ChipPart } from './parts/chip-part.tsx';
import { AvatarPart } from './parts/avatar-part.tsx';
import { CardPart } from './parts/card-part.tsx';
import { StatPart } from './parts/stat-part.tsx';
import { LayerRowPart } from './parts/layer-row-part.tsx';
import { TablePart } from './parts/table-part.tsx';
import { AiResultCardPart } from './parts/ai-result-card-part.tsx';
import { EmptyLoadingPart } from './parts/empty-loading-part.tsx';
import { DrawerPart } from './parts/drawer-part.tsx';

export const PREVIEW_PARTS: readonly PreviewPart[] = [
  // Primitives
  { id: 'button', label: 'Button', group: 'Primitives', Part: ButtonPart },
  { id: 'text', label: 'Text', group: 'Primitives', Part: TextPart },
  { id: 'field', label: 'Field · Input', group: 'Primitives', Part: FieldPart },
  { id: 'select', label: 'Select', group: 'Primitives', Part: SelectPart },
  { id: 'toggle', label: 'Toggle', group: 'Primitives', Part: TogglePart },
  { id: 'slider', label: 'Slider', group: 'Primitives', Part: SliderPart },
  { id: 'pickers', label: 'Font · Colour pickers', group: 'Primitives', Part: PickersPart },
  { id: 'tool-bar', label: 'Tool bar', group: 'Primitives', Part: ToolBarPart },
  // Display
  { id: 'pill', label: 'Pill', group: 'Display', Part: PillPart },
  { id: 'chip', label: 'Chip', group: 'Display', Part: ChipPart },
  { id: 'avatar', label: 'Avatar', group: 'Display', Part: AvatarPart },
  { id: 'card', label: 'Box · Card', group: 'Display', Part: CardPart },
  { id: 'stat', label: 'Stat', group: 'Display', Part: StatPart },
  { id: 'layer-row', label: 'Layer row', group: 'Display', Part: LayerRowPart },
  { id: 'table', label: 'Table', group: 'Display', Part: TablePart },
  { id: 'ai-result-card', label: 'AI result card', group: 'Display', Part: AiResultCardPart },
  { id: 'empty-loading', label: 'Empty · Loading', group: 'Display', Part: EmptyLoadingPart },
  // Overlays
  { id: 'drawer', label: 'DrawerService', group: 'Overlays', Part: DrawerPart },
];
