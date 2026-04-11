'use client';
import { m } from 'framer-motion';
import { cn } from '@/utils/cn';
import { fadeUp } from '@/utils/motionVariants';
import { useInView } from '@/hooks/useInView';

export function Eyebrow({ children, dark, center, className }) {
  const [ref, isInView] = useInView();

  return (
    <m.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={cn(
        'flex items-center gap-3 mb-4',
        center && 'justify-center',
        className
      )}
    >
      <span
        className={cn(
          'block w-10 h-0.5',
          dark ? 'bg-navy-pale/40' : 'bg-navy-light'
        )}
      />
      <span
        className={cn(
          'text-sm font-sans font-medium uppercase tracking-[0.15em]',
          dark ? 'text-navy-pale/60' : 'text-navy-light'
        )}
      >
        {children}
      </span>
    </m.div>
  );
}
