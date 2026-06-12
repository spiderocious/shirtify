'use client';

import {
  useCallback,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

import { cn } from '../utils/cn.ts';

const COMMIT_THRESHOLD_PCT = 0.3; // Drag 30% of width to commit; release earlier to spring back.
const EXIT_ANIMATION_MS = 200;

interface SwipeableToastProps {
  children: ReactNode;
  onDismiss: () => void;
  disabled: boolean;
}

/**
 * SwipeableToast — drag a toast left/right past 30% of its width to dismiss;
 * release earlier and it springs back. Pointer capture keeps the drag accurate
 * when the pointer leaves the element. (Adapted from the gbedity reference.)
 */
export function SwipeableToast({ children, onDismiss, disabled }: SwipeableToastProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);
  const elementWidth = useRef(0);
  const [dragX, setDragX] = useState(0);
  const [exiting, setExiting] = useState<null | 'left' | 'right'>(null);

  const transition =
    exiting !== null
      ? `transform ${EXIT_ANIMATION_MS}ms cubic-bezier(0.4, 0, 1, 1), opacity ${EXIT_ANIMATION_MS}ms cubic-bezier(0.4, 0, 1, 1)`
      : dragStartX.current === null
        ? 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)'
        : 'none';

  const exitingTransform =
    exiting === 'left'
      ? 'translateX(-120%)'
      : exiting === 'right'
        ? 'translateX(120%)'
        : `translateX(${dragX}px)`;

  const fadeOpacity =
    exiting !== null ? 0 : 1 - Math.min(Math.abs(dragX) / (elementWidth.current * 0.6 || 1), 0.6);

  const commit = useCallback(
    (direction: 'left' | 'right') => {
      setExiting(direction);
      window.setTimeout(onDismiss, EXIT_ANIMATION_MS);
    },
    [onDismiss],
  );

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (disabled || exiting !== null) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    dragStartX.current = e.clientX;
    elementWidth.current = ref.current?.getBoundingClientRect().width ?? 0;
    ref.current?.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (dragStartX.current === null) return;
    setDragX(e.clientX - dragStartX.current);
  }

  function handlePointerEnd(e: ReactPointerEvent<HTMLDivElement>) {
    if (dragStartX.current === null) return;
    const distance = e.clientX - dragStartX.current;
    const threshold = elementWidth.current * COMMIT_THRESHOLD_PCT;
    dragStartX.current = null;
    if (Math.abs(distance) >= threshold) {
      commit(distance < 0 ? 'left' : 'right');
    } else {
      setDragX(0);
    }
    ref.current?.releasePointerCapture(e.pointerId);
  }

  return (
    <div
      ref={ref}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      style={{
        transform: exitingTransform,
        opacity: fadeOpacity,
        transition,
        touchAction: disabled ? 'auto' : 'pan-y',
        cursor: disabled ? 'default' : dragStartX.current !== null ? 'grabbing' : 'grab',
        userSelect: disabled ? 'auto' : 'none',
      }}
      className={cn('select-none')}
    >
      {children}
    </div>
  );
}