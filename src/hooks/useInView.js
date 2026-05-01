'use client';
import { useRef, useState, useEffect } from 'react';

export function useInView({
  threshold = 0,
  rootMargin = '0px 0px -50px 0px',
  triggerOnce = true,
} = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const thresholdKey = Array.isArray(threshold) ? threshold.join(',') : String(threshold);
  const observerOptionsKey = `${rootMargin}|${thresholdKey}`;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce) observer.unobserve(element);
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
    // observerOptionsKey tracks rootMargin and threshold while keeping this array stable for Fast Refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [observerOptionsKey, triggerOnce]);

  return [ref, isInView];
}
