import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '../utils/cn.ts';
import { drawerStore, type ToastEntry, type ToastPosition, type ToastTone } from './drawer-store.ts';
import { SwipeableToast } from './swipeable-toast.tsx';

// Mount once at the app root. Renders all toasts into their 6 zones via a portal.

const ZONES: readonly ToastPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

const ZONE_CLASS: Record<ToastPosition, string> = {
  'top-left': 'top-4 left-4 items-start',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
  'top-right': 'top-4 right-4 items-end',
  'bottom-left': 'bottom-4 left-4 items-start',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
  'bottom-right': 'bottom-4 right-4 items-end',
};

const TONE_ICON: Record<ToastTone, { glyph: string; className: string }> = {
  go: { glyph: '✓', className: 'bg-lime text-lime-ink' },
  ai: { glyph: '✦', className: 'bg-blue text-white' },
  warn: { glyph: '!', className: 'bg-tomato text-white' },
  ink: { glyph: 'S', className: 'bg-ink text-paper' },
};

function ToastCard({ toast }: { readonly toast: ToastEntry }) {
  const icon = TONE_ICON[toast.tone];
  return (
    <div className="flex max-w-[420px] items-center gap-3 border-3 border-ink bg-paper-warm px-3.5 py-3 shadow-pop">
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center border-2.5 border-ink font-display text-[15px]',
          icon.className,
        )}
      >
        {icon.glyph}
      </span>
      <div className="flex-1 font-sans text-sm text-ink">{toast.message}</div>
      {toast.action ? (
        <button
          type="button"
          onClick={toast.action.onClick}
          className="font-heavy text-xs font-bold underline"
        >
          {toast.action.label}
        </button>
      ) : null}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => drawerStore.dismissToast(toast.id)}
        className="font-display text-sm text-ink-3"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastHost() {
  const state = useSyncExternalStore(drawerStore.subscribe, drawerStore.getState, drawerStore.getState);
  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {ZONES.map((zone) => {
        const toasts = state.toasts.filter((t) => t.position === zone);
        if (toasts.length === 0) return null;
        const fromBottom = zone.startsWith('bottom');
        return (
          <div
            key={zone}
            className={cn('pointer-events-none fixed z-[60] flex flex-col gap-2.5', ZONE_CLASS[zone])}
          >
            {(fromBottom ? [...toasts].reverse() : toasts).map((toast) => (
              <div key={toast.id} className="pointer-events-auto">
                <SwipeableToast disabled={toast.sticky} onDismiss={() => drawerStore.dismissToast(toast.id)}>
                  <ToastCard toast={toast} />
                </SwipeableToast>
              </div>
            ))}
          </div>
        );
      })}
    </>,
    document.body,
  );
}
