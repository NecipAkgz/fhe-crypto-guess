import { useEffect, useLayoutEffect } from 'react';

// Use useLayoutEffect to prevent scroll jump if possible, otherwise fall back to useEffect
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function useLockBodyScroll(isLocked: boolean) {
  useIsomorphicLayoutEffect(() => {
    if (!isLocked) return;

    // Save original body style
    const originalStyle = window.getComputedStyle(document.body).overflow;

    // Prevent scrolling
    document.body.style.overflow = 'hidden';

    // Re-enable scrolling when component unmounts or isLocked becomes false
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isLocked]);
}
