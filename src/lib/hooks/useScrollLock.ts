import { useEffect } from 'react';

let activeLockCount = 0;

/**
 * Custom React Hook to lock background scrolling on both <html> and <body> elements
 * whenever a pop-up modal is open. Handles stacked/multiple modals gracefully.
 */
export function useScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;

    activeLockCount += 1;

    const body = document.body;
    const html = document.documentElement;

    const originalBodyOverflow = body.style.overflow;
    const originalHtmlOverflow = html.style.overflow;
    const originalTouchAction = body.style.touchAction;

    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    body.style.touchAction = 'none';

    return () => {
      activeLockCount = Math.max(0, activeLockCount - 1);
      if (activeLockCount === 0) {
        body.style.overflow = originalBodyOverflow;
        html.style.overflow = originalHtmlOverflow;
        body.style.touchAction = originalTouchAction;
      }
    };
  }, [isOpen]);
}
