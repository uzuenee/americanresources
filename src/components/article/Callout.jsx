import { cn } from '@/utils/cn';

const variants = {
  tip: {
    wrapper: 'bg-sage-light border-l-[3px] border-l-sage',
    label: 'TIP',
    labelColor: 'text-sage',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6M10 22h4M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14" />
      </svg>
    ),
  },
  warning: {
    wrapper: 'bg-copper/20 border-l-[3px] border-l-copper',
    label: 'WARNING',
    labelColor: 'text-copper-dark',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
      </svg>
    ),
  },
  compliance: {
    wrapper: 'bg-navy-pale border-l-[3px] border-l-navy',
    label: 'COMPLIANCE NOTE',
    labelColor: 'text-navy',
    icon: null,
  },
  note: {
    wrapper: 'bg-offwhite-alt border-l-[3px] border-l-border',
    label: 'NOTE',
    labelColor: 'text-text-muted',
    icon: null,
  },
};

export function Callout({ variant = 'note', children }) {
  const v = variants[variant] || variants.note;

  return (
    <aside className={cn('my-8 rounded-sm px-6 py-5', v.wrapper)} role="note">
      <div className="flex items-center gap-2 mb-2">
        {v.icon && <span className={v.labelColor}>{v.icon}</span>}
        <p className={cn('font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.14em]', v.labelColor)} aria-hidden="true">
          {v.label}
        </p>
      </div>
      <div className="font-sans text-[0.9375rem] leading-[1.6] text-text-primary">
        {children}
      </div>
    </aside>
  );
}
