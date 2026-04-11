'use client';

import { usePathname } from 'next/navigation';
import { Children, useContext, useRef, useState, useEffect } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';

function FrozenRouter({ children }) {
  const context = useContext(LayoutRouterContext);
  const frozen = useRef(context).current;
  return (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

const variants = {
  hidden: { opacity: 0, y: 24 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
};

export function PageTransition({ children }) {
  const pathname = usePathname();
  const childArray = Children.toArray(children);
  const currentHero = childArray[0];

  // Displayed content lags behind during exit so the old page stays rendered
  const [displayed, setDisplayed] = useState({ children, pathname });
  const [show, setShow] = useState(true);

  // Keep the latest children/pathname available inside the exit callback
  const latestRef = useRef({ children, pathname });
  useEffect(() => {
    latestRef.current = { children, pathname };
  });

  useEffect(() => {
    if (pathname !== displayed.pathname) {
      // New route: hide current content, which triggers AnimatePresence exit
      setShow(false);
    }
  }, [pathname, displayed.pathname]);

  const handleExitComplete = () => {
    // Swap to latest content, then bring it in
    setDisplayed({
      children: latestRef.current.children,
      pathname: latestRef.current.pathname,
    });
    setShow(true);
  };

  const displayedRest = Children.toArray(displayed.children).slice(1);

  return (
    <>
      {/* Hero always reflects the latest route — updates in place, no animation */}
      {currentHero}
      <AnimatePresence initial={false} mode="wait" onExitComplete={handleExitComplete}>
        {show && (
          <m.div
            key={displayed.pathname}
            variants={variants}
            initial="hidden"
            animate="enter"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          >
            <FrozenRouter>{displayedRest}</FrozenRouter>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
