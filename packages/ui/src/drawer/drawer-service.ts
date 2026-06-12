import { type ReactNode } from 'react';

import {
  drawerStore,
  type ToastTone,
  type ToastPosition,
  type BannerPosition,
  type ModalPosition,
} from './drawer-store.ts';

// The imperative singleton — call from anywhere, no props or context.
//   DrawerService.toast('Link copied', { tone: 'go' });
//   DrawerService.confirm('Archive this session?', { onConfirm });
//   DrawerService.critical('Delete this design', { confirmPhrase: 'DELETE', onConfirm });

export interface ToastOptions {
  tone?: ToastTone;
  durationMs?: number;
  sticky?: boolean;
  position?: ToastPosition;
  action?: { label: string; onClick: () => void };
}

export interface BannerOptions {
  tone?: ToastTone;
  description?: ReactNode;
  icon?: ReactNode;
  cta?: { label: string; onClick: () => void };
  position?: BannerPosition;
  sticky?: boolean;
  durationMs?: number;
}

export interface ConfirmOptions {
  onConfirm: () => void;
  onCancel?: () => void;
  description?: ReactNode;
  destructive?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  position?: ModalPosition;
}

export interface CriticalOptions {
  onConfirm: () => void;
  onCancel?: () => void;
  /** The literal word the user must type (default "DELETE"). */
  confirmPhrase?: string;
  confirmPrompt?: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface CustomModalOptions {
  position?: ModalPosition;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  sticky?: boolean;
  hideCloseButton?: boolean;
  onClose?: () => void;
}

export const DrawerService = {
  toast(message: ReactNode, options: ToastOptions = {}): string {
    return drawerStore.pushToast({
      message,
      tone: options.tone ?? 'go',
      durationMs: options.durationMs ?? 3500,
      sticky: options.sticky ?? false,
      position: options.position ?? 'bottom-center',
      action: options.action,
    });
  },

  dismissToast(id: string): void {
    drawerStore.dismissToast(id);
  },

  banner(title: ReactNode, options: BannerOptions = {}): string {
    return drawerStore.pushBanner({
      title,
      tone: options.tone ?? 'ink',
      description: options.description,
      icon: options.icon,
      cta: options.cta,
      position: options.position ?? 'top',
      sticky: options.sticky ?? true,
      durationMs: options.durationMs ?? 0,
    });
  },

  dismissBanner(id: string): void {
    drawerStore.dismissBanner(id);
  },

  confirm(title: ReactNode, options: ConfirmOptions): void {
    drawerStore.openModal({
      kind: options.destructive === true ? 'danger' : 'standard',
      title,
      description: options.description,
      confirmLabel: options.confirmLabel ?? 'Confirm',
      cancelLabel: options.cancelLabel ?? 'Cancel',
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
      position: options.position ?? 'center',
      closeOnOutsideClick: true,
      closeOnEscape: true,
      sticky: false,
    });
  },

  /** The irreversible action — type-the-word-to-confirm. */
  critical(title: ReactNode, options: CriticalOptions): void {
    drawerStore.openModal({
      kind: 'critical',
      title,
      description: options.description,
      confirmPhrase: options.confirmPhrase ?? 'DELETE',
      confirmPrompt: options.confirmPrompt ?? `Type ${options.confirmPhrase ?? 'DELETE'} to confirm`,
      confirmLabel: options.confirmLabel ?? 'Delete forever',
      cancelLabel: options.cancelLabel ?? 'Keep it',
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
      position: 'center',
      closeOnOutsideClick: false,
      closeOnEscape: false,
      sticky: true,
    });
  },

  openModal(body: ReactNode, options: CustomModalOptions = {}): void {
    drawerStore.openModal({
      kind: 'custom',
      body,
      position: options.position ?? 'center',
      closeOnOutsideClick: options.closeOnOutsideClick ?? true,
      closeOnEscape: options.closeOnEscape ?? true,
      sticky: options.sticky ?? false,
      hideCloseButton: options.hideCloseButton ?? false,
      onCancel: options.onClose,
    });
  },

  closeModal(): void {
    drawerStore.closeModal();
  },
};
