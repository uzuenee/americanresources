'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useInView } from './useInView';

export function useCounter(end, duration = 2000) {
  const [count, setCount] = useState(0);
  const [ref, isInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const hasStarted = useRef(false);

  const startCounting = useCallback(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const numericEnd = parseFloat(String(end).replace(/[^0-9.]/g, ''));
    if (isNaN(numericEnd)) return;

    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const raw = eased * numericEnd;
      setCount(numericEnd % 1 === 0 ? Math.floor(raw) : parseFloat(raw.toFixed(1)));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(numericEnd);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  useEffect(() => {
    if (isInView) startCounting();
  }, [isInView, startCounting]);

  return { ref, count };
}
