'use client';

import { usePathname } from 'next/navigation';
import { useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';

const ROUTE_ORDER = {
  '/login': 0,
  '/signup': 1,
};

function FrozenRouter({ children }) {
  const context = useContext(LayoutRouterContext);
  const [frozen] = useState(context);
  return (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

const variants = {
  hidden: (direction) => ({ opacity: 0, x: direction * 40 }),
  enter: { opacity: 1, x: 0 },
  exit: (direction) => ({ opacity: 0, x: direction * -40 }),
};

const transition = { duration: 0.4, ease: [0.25, 1, 0.5, 1] };

export function AuthPageTransition({ children }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  const [displayed, setDisplayed] = useState({ children, pathname });
  const [show, setShow] = useState(true);

  const latestRef = useRef({ children, pathname });
  useEffect(() => {
    latestRef.current = { children, pathname };
  });

  const direction =
    Math.sign((ROUTE_ORDER[pathname] ?? 0) - (ROUTE_ORDER[displayed.pathname] ?? 0)) || 1;

  useEffect(() => {
    if (pathname !== displayed.pathname) {
      queueMicrotask(() => setShow(false));
    }
  }, [pathname, displayed.pathname]);

  const handleExitComplete = () => {
    setDisplayed({
      children: latestRef.current.children,
      pathname: latestRef.current.pathname,
    });
    setShow(true);
  };

  if (prefersReducedMotion) {
    return children;
  }

  return (
    <div className="relative lg:min-h-[580px]">
      <AnimatePresence
        initial={false}
        mode="wait"
        custom={direction}
        onExitComplete={handleExitComplete}
      >
        {show && (
          <m.div
            key={displayed.pathname}
            custom={direction}
            variants={variants}
            initial="hidden"
            animate="enter"
            exit="exit"
            transition={transition}
          >
            <FrozenRouter>{displayed.children}</FrozenRouter>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
