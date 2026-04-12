'use client';

import { useId } from 'react';
import { cn } from '@/utils/cn';

const baseInput =
  'w-full rounded-sm border border-border bg-surface px-3.5 py-3 font-sans text-[0.9375rem] text-text-primary placeholder:text-text-muted/60 transition-colors duration-200 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15 disabled:cursor-not-allowed disabled:bg-offwhite-alt';

export function FormField({ label, helper, error, id, children, className, required, ...props }) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="font-sans text-[0.8125rem] font-semibold text-text-muted"
        >
          {label}
          {required && <span className="ml-0.5 text-accent">*</span>}
        </label>
      )}
      {children ? (
        typeof children === 'function'
          ? children({ id: inputId, className: baseInput })
          : children
      ) : (
        <input id={inputId} className={baseInput} {...props} />
      )}
      {helper && !error && (
        <p className="font-sans text-[0.75rem] text-text-muted">{helper}</p>
      )}
      {error && (
        <p className="font-sans text-[0.75rem] text-danger">{error}</p>
      )}
    </div>
  );
}

export function Textarea({ rows = 4, className, ...props }) {
  return (
    <textarea
      rows={rows}
      className={cn(baseInput, 'resize-y leading-relaxed', className)}
      {...props}
    />
  );
}

export function Select({ children, className, ...props }) {
  return (
    <select className={cn(baseInput, 'appearance-none pr-10', className)} {...props}>
      {children}
    </select>
  );
}
