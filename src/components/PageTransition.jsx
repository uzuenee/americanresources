'use client';

import { usePathname } from 'next/navigation';
import { Children, useContext, useRef } from 'react';
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
  const hero = childArray[0];
  const rest = childArray.slice(1);

  return (
    <>
      {/* Hero renders outside the transition — updates in place, no fade */}
      {hero}
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={pathname}
          variants={variants}
          initial="hidden"
          animate="enter"
          exit="exit"
          transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
        >
          <FrozenRouter>{rest}</FrozenRouter>
        </m.div>
      </AnimatePresence>
    </>
  );
}
