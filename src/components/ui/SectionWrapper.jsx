import { cn } from '@/utils/cn';

export function SectionWrapper({ children, dark, className, innerClassName, id }) {
  return (
    <section
      id={id}
      className={cn(
        'relative',
        dark ? 'bg-navy-dark text-text-on-dark' : 'bg-offwhite text-text-primary',
        className
      )}
    >
      <div className={cn('mx-auto max-w-7xl px-6 lg:px-16 py-24 md:py-32 lg:py-40', innerClassName)}>
        {children}
      </div>
    </section>
  );
}
