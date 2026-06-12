'use client';

import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '../utils/cn.ts';
import { drawerStore, type BannerEntry, type ToastTone } from './drawer-store.ts';

// Mount once at the app root. Top/bottom standing strips.

const TONE: Record<ToastTone, string> = {
  go: 'bg-go-tint text-ink',
  ai: 'bg-blue text-white',
  warn: 'bg-tomato text-white',
  ink: 'bg-ink text-paper',
};

function Banner({ banner }: { readonly banner: BannerEntry }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 border-3 border-ink px-4 py-3 shadow-pop-sm',
        TONE[banner.tone],
      )}
    >
      {banner.icon ? <span className="text-lg">{banner.icon}</span> : null}
      <div className="flex-1">
        <div className="font-sans text-sm font-semibold">{banner.title}</div>
        {banner.description ? (
          <div className="font-sans text-[13px] opacity-90">{banner.description}</div>
        ) : null}
      </div>
      {banner.cta ? (
        <button
          type="button"
          onClick={banner.cta.onClick}
          className="border-2 border-current px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
        >
          {banner.cta.label}
        </button>
      ) : null}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => drawerStore.dismissBanner(banner.id)}
        className="font-display text-sm"
      >
        ✕
      </button>
    </div>
  );
}

export function BannerHost() {
  const state = useSyncExternalStore(drawerStore.subscribe, drawerStore.getState, drawerStore.getState);
  if (typeof document === 'undefined') return null;

  const top = state.banners.filter((b) => b.position === 'top');
  const bottom = state.banners.filter((b) => b.position === 'bottom');

  return createPortal(
    <>
      {top.length > 0 ? (
        <div className="fixed inset-x-0 top-0 z-[55] flex flex-col gap-2 p-3">
          {top.map((banner) => (
            <Banner key={banner.id} banner={banner} />
          ))}
        </div>
      ) : null}
      {bottom.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-[55] flex flex-col gap-2 p-3">
          {bottom.map((banner) => (
            <Banner key={banner.id} banner={banner} />
          ))}
        </div>
      ) : null}
    </>,
    document.body,
  );
}