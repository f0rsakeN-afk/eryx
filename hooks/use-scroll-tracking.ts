import { useRef, useCallback, useEffect } from 'react';

const TOUCH_MOVE_THRESHOLD = 10;
const TOUCH_END_SETTLE_MS = 150;

export function useScrollTracking(
  scrollRef: React.RefObject<HTMLElement | null>,
  options?: {
    onWheelUp?: () => void;
    onNearBottom?: () => void;
  },
) {
  const touchActiveRef = useRef(false);
  const lastTouchYRef = useRef<number | null>(null);
  const touchEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasScrolledUpRef = useRef(false);

  const markScrollUp = useCallback(() => {
    hasScrolledUpRef.current = true;
    options?.onWheelUp?.();
  }, [options]);

  const markAtBottom = useCallback(() => {
    hasScrolledUpRef.current = false;
    options?.onNearBottom?.();
  }, [options]);

  const syncMarkAtBottom = useCallback(() => {
    if (!touchActiveRef.current) {
      markAtBottom();
    }
  }, [markAtBottom]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchActiveRef.current = true;
      lastTouchYRef.current = e.touches[0]?.clientY ?? null;
      markAtBottom();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchActiveRef.current) return;
      const y = e.touches[0]?.clientY;
      if (lastTouchYRef.current === null || y === null) return;

      const dy = y - lastTouchYRef.current;
      if (Math.abs(dy) >= TOUCH_MOVE_THRESHOLD) {
        if (dy < 0) markScrollUp();
        else markAtBottom();
      }
      lastTouchYRef.current = y;
    };

    const handleTouchEnd = () => {
      touchActiveRef.current = false;
      lastTouchYRef.current = null;
      if (touchEndTimeoutRef.current) clearTimeout(touchEndTimeoutRef.current);
      touchEndTimeoutRef.current = setTimeout(() => {
        touchEndTimeoutRef.current = null;
        markAtBottom();
      }, TOUCH_END_SETTLE_MS);
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) markScrollUp();
      else markAtBottom();
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    el.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    el.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
      el.removeEventListener('wheel', handleWheel);
    };
  }, [scrollRef, markScrollUp, markAtBottom]);

  return {
    touchActiveRef,
    hasScrolledUpRef,
    syncMarkAtBottom,
  };
}
