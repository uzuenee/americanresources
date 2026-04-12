'use client';

import { cn } from '@/utils/cn';

export function StatCard({ label, value, accent, className }) {
  return (
    <div
      className={cn(
        'rounded-sm border border-border/70 bg-surface p-6',
        className
      )}
    >
      <p className="font-serif text-[1.75rem] font-bold leading-none text-text-primary tabular-nums">
        <span
          className={cn(
            accent === 'accent' && 'text-accent',
            accent === 'sage' && 'text-sage'
          )}
        >
          {value}
        </span>
      </p>
      <p className="mt-2 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-text-muted">
        {label}
      </p>
    </div>
  );
}
