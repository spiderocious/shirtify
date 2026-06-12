'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '../utils/cn.ts';
import {
  drawerStore,
  type ModalEntry,
  type ModalPosition,
  type CriticalModalEntry,
  type StandardModalEntry,
  type CustomModalEntry,
} from './drawer-store.ts';

// Mount once at the app root. Renders the one open modal (standard / danger /
// critical / custom) on a halftone scrim. Visual spec: 40-modals.html.

const POSITION: Record<ModalPosition, string> = {
  center: 'items-center justify-center',
  top: 'items-start justify-center pt-10',
  bottom: 'items-end justify-center pb-10',
  left: 'items-stretch justify-start',
  right: 'items-stretch justify-end',
};

function closeWith(onCancel?: () => void) {
  onCancel?.();
  drawerStore.closeModal();
}

function StandardBody({ entry }: { readonly entry: StandardModalEntry }) {
  return (
    <div className="w-[380px] border-3 border-ink bg-paper shadow-pop-lg">
      <div
        className={cn(
          'border-b-3 border-ink px-[18px] py-3.5 font-display text-lg',
          entry.kind === 'danger' ? 'bg-crit text-white' : 'bg-lime text-lime-ink',
        )}
      >
        {entry.title}
      </div>
      {entry.description ? (
        <div className="px-[18px] py-[18px] font-sans text-sm leading-relaxed text-ink-2">
          {entry.description}
        </div>
      ) : null}
      <div className="flex justify-end gap-2.5 border-t-3 border-ink px-[18px] py-4">
        <button
          type="button"
          onClick={() => closeWith(entry.onCancel)}
          className="border-3 border-ink bg-transparent px-4 py-2 font-heavy text-sm font-extrabold active:translate-y-px"
        >
          {entry.cancelLabel ?? 'Cancel'}
        </button>
        <button
          type="button"
          onClick={() => {
            entry.onConfirm();
            drawerStore.closeModal();
          }}
          className={cn(
            'border-3 border-ink px-4 py-2 font-heavy text-sm font-extrabold shadow-pop active:translate-x-1 active:translate-y-1 active:shadow-none',
            entry.kind === 'danger' ? 'bg-crit text-white' : 'bg-lime text-lime-ink',
          )}
        >
          {entry.confirmLabel}
        </button>
      </div>
    </div>
  );
}

function CriticalBody({ entry }: { readonly entry: CriticalModalEntry }) {
  const [typed, setTyped] = useState('');
  const armed = typed.trim().toUpperCase() === entry.confirmPhrase.toUpperCase();
  return (
    <div className="w-[380px] border-3 border-ink bg-paper shadow-pop-lg">
      <div className="border-b-3 border-ink bg-crit px-[18px] py-3.5 font-display text-lg text-white">
        ⚠ {entry.title}
      </div>
      <div className="px-[18px] py-[18px]">
        {entry.description ? (
          <p className="font-sans text-sm leading-relaxed text-ink-2">{entry.description}</p>
        ) : null}
        <div className="mt-3.5 border-3 border-crit bg-crit-tint p-3.5">
          <div className="mb-2 font-mono text-[11px] font-bold text-crit">{entry.confirmPrompt}</div>
          <input
            value={typed}
            autoFocus
            onChange={(e) => setTyped(e.target.value)}
            placeholder={entry.confirmPhrase}
            className="w-full border-3 border-ink bg-paper-warm px-3 py-2.5 font-mono text-[15px] font-bold uppercase tracking-[0.1em] outline-none"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2.5 border-t-3 border-ink px-[18px] py-4">
        <button
          type="button"
          onClick={() => closeWith(entry.onCancel)}
          className="border-3 border-ink bg-transparent px-4 py-2 font-heavy text-sm font-extrabold active:translate-y-px"
        >
          {entry.cancelLabel ?? 'Keep it'}
        </button>
        <button
          type="button"
          disabled={!armed}
          onClick={() => {
            entry.onConfirm();
            drawerStore.closeModal();
          }}
          className="border-3 border-crit bg-transparent px-4 py-2 font-heavy text-sm font-extrabold text-crit shadow-pop-crit hover:bg-crit hover:text-white active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
        >
          {entry.confirmLabel}
        </button>
      </div>
    </div>
  );
}

function CustomBody({ entry }: { readonly entry: CustomModalEntry }) {
  return (
    <div className="relative border-3 border-ink bg-paper shadow-pop-lg">
      {!entry.hideCloseButton ? (
        <button
          type="button"
          aria-label="Close"
          onClick={() => closeWith(entry.onCancel)}
          className="absolute right-2 top-2 z-10 font-display text-sm text-ink-3"
        >
          ✕
        </button>
      ) : null}
      {entry.body}
    </div>
  );
}

function ModalBody({ entry }: { readonly entry: ModalEntry }) {
  if (entry.kind === 'critical') return <CriticalBody entry={entry} />;
  if (entry.kind === 'custom') return <CustomBody entry={entry} />;
  return <StandardBody entry={entry} />;
}

export function ModalHost() {
  const state = useSyncExternalStore(drawerStore.subscribe, drawerStore.getState, drawerStore.getState);
  const modal = state.modal;

  useEffect(() => {
    if (!modal || !modal.closeOnEscape) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeWith(modal.onCancel);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal]);

  if (typeof document === 'undefined' || !modal) return null;

  return createPortal(
    <div
      className={cn('shirtify-halftone fixed inset-0 z-[70] flex p-6', POSITION[modal.position])}
      onClick={() => {
        if (modal.closeOnOutsideClick) closeWith(modal.onCancel);
      }}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <ModalBody entry={modal} />
      </div>
    </div>,
    document.body,
  );
}