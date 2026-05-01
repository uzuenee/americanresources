import { cn } from '@/utils/cn';

export function PullQuote({ children, attribution }) {
  return (
    <figure className={cn('relative my-16', 'border-l-[3px] border-copper bg-copper/[0.04] pl-6 pr-6 py-2')}>
      <blockquote className="font-[family-name:var(--font-display)] text-[clamp(1.25rem,2.5vw,1.625rem)] italic font-normal leading-[1.5] text-text-primary">
        {children}
      </blockquote>
      {attribution && (
        <figcaption className="mt-3 flex items-center gap-3">
          <span className="inline-block h-px w-6 bg-copper" aria-hidden="true" />
          <span className="font-sans text-[0.8125rem] font-medium text-text-muted">
            {attribution}
          </span>
        </figcaption>
      )}
    </figure>
  );
}
