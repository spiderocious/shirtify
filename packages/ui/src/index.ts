// @repo/ui — Shirtify component library. Stance #28 Neobrutalist pop.
// Visual spec: design-system/projects/shirtify/preview/

// Theme
export * from './theme/index.ts';

// Utils
export { cn } from './utils/cn.ts';

// Primitives
export { AppButton } from './primitives/app-button/index.ts';
export type {
  AppButtonVariant,
  AppButtonSize,
  AppButtonProps,
} from './primitives/app-button/index.ts';
export { AppText } from './primitives/app-text/index.ts';
export type { AppTextVariant, AppTextProps } from './primitives/app-text/index.ts';
export { AppField, AppInput, AppTextarea } from './primitives/app-field/index.ts';
export type { AppFieldProps, AppInputProps, AppTextareaProps } from './primitives/app-field/index.ts';
export { AppSelect } from './primitives/app-select/index.ts';
export type { AppSelectProps, AppSelectOption } from './primitives/app-select/index.ts';
export { AppToggle } from './primitives/app-toggle/index.ts';
export type { AppToggleProps } from './primitives/app-toggle/index.ts';
export { AppSlider } from './primitives/app-slider/index.ts';
export type { AppSliderProps } from './primitives/app-slider/index.ts';
export { AppFontPicker, AppColourSwatches } from './primitives/app-pickers/index.ts';
export type {
  AppFontPickerProps,
  AppFontOption,
  AppColourSwatchesProps,
} from './primitives/app-pickers/index.ts';
export { AppToolBar } from './primitives/app-tool-bar/index.ts';
export type { AppToolBarProps, AppTool } from './primitives/app-tool-bar/index.ts';

// Display
export { AppPill } from './display/app-pill/index.ts';
export type { AppPillProps, AppPillTone } from './display/app-pill/index.ts';
export { AppChip } from './display/app-chip/index.ts';
export type { AppChipProps } from './display/app-chip/index.ts';
export { AppAvatar } from './display/app-avatar/index.ts';
export type { AppAvatarProps, AppAvatarTone, AppAvatarSize } from './display/app-avatar/index.ts';
export { AppBox, AppCard } from './display/app-card/index.ts';
export type { AppBoxProps, AppCardProps } from './display/app-card/index.ts';
export { AppStat } from './display/app-stat/index.ts';
export type { AppStatProps } from './display/app-stat/index.ts';
export { AppLayerRow } from './display/app-layer-row/index.ts';
export type { AppLayerRowProps, AppLayerKind } from './display/app-layer-row/index.ts';
export { AppTable } from './display/app-table/index.ts';
export type { AppTableProps, AppTableColumn } from './display/app-table/index.ts';
export { AppAiResultCard } from './display/app-ai-result-card/index.ts';
export type { AppAiResultCardProps } from './display/app-ai-result-card/index.ts';
export { AppEmptyState, AppSkeleton } from './display/app-empty-state/index.ts';
export type { AppEmptyStateProps, AppSkeletonProps } from './display/app-empty-state/index.ts';

// Overlays — the imperative DrawerService layer
export {
  DrawerService,
  ToastHost,
  BannerHost,
  ModalHost,
} from './drawer/index.ts';
export type {
  ToastTone,
  ToastOptions,
  BannerOptions,
  ConfirmOptions,
  CriticalOptions,
  ModalPosition,
} from './drawer/index.ts';

// Icons are NOT re-exported here. Import them via the dedicated proxy:
//   import { IconHome } from '@icons';
