'use client';

import { cn } from '@/utils/cn';

export function Card({ children, className, as: Component = 'div', ...rest }) {
  return (
    <Component
      className={cn(
        'rounded-sm border border-border/70 bg-surface p-6',
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ title, description, action, className }) {
  return (
    <div className={cn('mb-5 flex items-start justify-between gap-4', className)}>
      <div>
        <h2 className="font-serif text-[1.125rem] font-semibold text-text-primary">{title}</h2>
        {description && (
          <p className="mt-0.5 font-sans text-[0.8125rem] text-text-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function DefList({ items, className }) {
  return (
    <dl className={cn('grid gap-4', className)}>
      {items.map((item, idx) => (
        <div key={idx} className="grid grid-cols-1 gap-0.5 sm:grid-cols-[9rem_1fr] sm:gap-4">
          <dt className="font-sans text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-text-muted">
            {item.label}
          </dt>
          <dd className="font-sans text-[0.875rem] text-text-primary">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
