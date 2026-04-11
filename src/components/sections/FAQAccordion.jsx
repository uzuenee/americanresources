'use client';
import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';

function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className={cn(
      'border-b border-border transition-colors duration-300',
      isOpen && 'bg-navy-pale/10 -mx-4 px-4 rounded-lg border-transparent'
    )}>
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-5 md:py-6 text-left group cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className={cn(
          'font-sans font-semibold text-base md:text-lg pr-8 transition-colors',
          isOpen ? 'text-navy' : 'text-text-primary group-hover:text-navy-light'
        )}>
          {question}
        </span>
        <m.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn(
            'flex-shrink-0 transition-colors duration-200',
            isOpen ? 'text-accent' : 'text-text-muted'
          )}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </m.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <p className="font-sans text-base text-text-muted leading-relaxed pb-6 pr-12">
              {answer}
            </p>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQAccordion({ items, title, className }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className={cn('w-full', className)}>
      {title && (
        <AnimateOnScroll>
          <h3 className="font-serif text-2xl md:text-3xl text-text-primary mb-6">{title}</h3>
        </AnimateOnScroll>
      )}
      <div>
        {items.map((item, i) => (
          <AnimateOnScroll key={i} delay={i * 0.05}>
            <FAQItem
              question={item.q}
              answer={item.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          </AnimateOnScroll>
        ))}
      </div>
    </div>
  );
}
