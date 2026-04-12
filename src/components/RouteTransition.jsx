'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { m, useReducedMotion } from 'framer-motion';

const RouteTransitionContext = createContext(null);

const COVER_MS = 450;
const REVEAL_MS = 400;
const MAX_WAIT_MS = 700;

export function useRouteTransition() {
  const ctx = useContext(RouteTransitionContext);
  const router = useRouter();
  if (ctx) return ctx;
  return {
    transitionTo: (href) => router.push(href),
    phase: 'idle',
    direction: 'forward',
  };
}

export function RouteTransitionProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState('idle');
  const [direction, setDirection] = useState('forward');
  const pendingHrefRef = useRef(null);
  const targetPathnameRef = useRef(null);
  const hasNavigatedRef = useRef(false);
  const busyRef = useRef(false);

  const transitionTo = useCallback(
    (href, dir = 'forward') => {
      if (!href) return;
      if (prefersReducedMotion) {
        router.push(href);
        return;
      }
      if (busyRef.current) return;
      busyRef.current = true;
      hasNavigatedRef.current = false;
      pendingHrefRef.current = href;
      targetPathnameRef.current = href.split('?')[0].split('#')[0];
      setDirection(dir);
      setPhase('covering');
    },
    [prefersReducedMotion, router]
  );

  // Phase: covering → after COVER_MS, push the route (but stay covered until pathname commits)
  useEffect(() => {
    if (phase !== 'covering') return;
    const coverTimer = setTimeout(() => {
      if (pendingHrefRef.current && !hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        router.push(pendingHrefRef.current);
        pendingHrefRef.current = null;
      }
    }, COVER_MS);

    // Safety: if pathname never matches within MAX_WAIT_MS after cover, reveal anyway
    const safetyTimer = setTimeout(() => {
      if (phase === 'covering') setPhase('revealing');
    }, COVER_MS + MAX_WAIT_MS);

    return () => {
      clearTimeout(coverTimer);
      clearTimeout(safetyTimer);
    };
  }, [phase, router]);

  // When pathname commits to target during covering, start revealing on the next frame
  useEffect(() => {
    if (phase !== 'covering' || !hasNavigatedRef.current) return;
    if (!targetPathnameRef.current) return;
    if (pathname !== targetPathnameRef.current) return;
    targetPathnameRef.current = null;
    const id = requestAnimationFrame(() => setPhase('revealing'));
    return () => cancelAnimationFrame(id);
  }, [pathname, phase]);

  // Phase: revealing → after REVEAL_MS, go idle
  useEffect(() => {
    if (phase !== 'revealing') return;
    const t = setTimeout(() => {
      setPhase('idle');
      busyRef.current = false;
    }, REVEAL_MS);
    return () => clearTimeout(t);
  }, [phase]);

  const curtainX =
    phase === 'idle'
      ? direction === 'forward' ? '100%' : '-100%'
      : phase === 'covering'
        ? '0%'
        : direction === 'forward' ? '-100%' : '100%';

  const curtainTransition =
    phase === 'idle'
      ? { duration: 0 }
      : phase === 'covering'
        ? { duration: COVER_MS / 1000, ease: [0.16, 1, 0.3, 1] }
        : { duration: REVEAL_MS / 1000, ease: [0.25, 1, 0.5, 1] };

  return (
    <RouteTransitionContext.Provider value={{ transitionTo, phase, direction }}>
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
      >
        <m.div
          className="absolute inset-0 bg-navy-dark"
          initial={false}
          animate={{ x: curtainX }}
          transition={curtainTransition}
          style={{ willChange: 'transform' }}
        />
      </div>
    </RouteTransitionContext.Provider>
  );
}
