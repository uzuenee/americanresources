'use client';
import { m, useReducedMotion } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import { fadeUp } from '@/utils/motionVariants';
import { cn } from '@/utils/cn';

export function AnimateOnScroll({
  children,
  variants = fadeUp,
  delay = 0,
  className,
}) {
  const [ref, isInView] = useInView();
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  const modifiedVariants = {
    hidden: variants.hidden,
    visible: {
      ...variants.visible,
      transition: {
        ...variants.visible?.transition,
        delay,
      },
    },
  };

  return (
    <m.div
      ref={ref}
      variants={modifiedVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={cn(className)}
    >
      {children}
    </m.div>
  );
}
