'use client';
import { m } from 'framer-motion';
import { cn } from '@/utils/cn';
import { fadeUp } from '@/utils/motionVariants';
import { useInView } from '@/hooks/useInView';

export function Eyebrow({ children, dark, center, immediate, className }) {
  const [ref, isInView] = useInView();
  const shouldAnimate = immediate || isInView;

  return (
    <m.div
      ref={immediate ? undefined : ref}
      variants={fadeUp}
      initial="hidden"
      animate={shouldAnimate ? 'visible' : 'hidden'}
      className={cn(
        'flex items-center gap-3 mb-4',
        center && 'justify-center',
        className
      )}
    >
      <span
        className="block w-10 h-1 bg-copper"
        aria-hidden="true"
      />
      <span
        className={cn(
          'text-sm font-sans font-medium uppercase tracking-[0.15em]',
          dark ? 'text-navy-pale' : 'text-navy-light'
        )}
      >
        {children}
      </span>
      {center && (
        <span
          className="block w-10 h-1 bg-copper"
          aria-hidden="true"
        />
      )}
    </m.div>
  );
}
