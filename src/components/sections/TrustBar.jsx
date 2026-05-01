'use client';
import { useCounter } from '@/hooks/useCounter';
import { cn } from '@/utils/cn';

function StatItem({ value, label, prefix = '', suffix = '' }) {
  const numericValue = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  const { ref, count } = useCounter(numericValue);

  return (
    <div ref={ref} className="text-center px-4 py-4">
      <div className="font-mono text-4xl md:text-5xl text-navy font-normal tracking-tight">
        <span className="text-accent">{prefix}</span>{count.toLocaleString()}<span className="text-accent">{suffix}</span>
      </div>
      <div className="font-sans text-sm uppercase tracking-[0.08em] text-text-muted mt-2 font-medium">
        {label}
      </div>
    </div>
  );
}

export function TrustBar() {
  const stats = [
    { value: 20, suffix: '+', label: 'Years of Experience' },
    { value: 200, suffix: '+', label: 'Business Partners' },
    { value: 15000, suffix: '+', label: 'Tons Recycled Annually' },
    { value: 6, suffix: '', label: 'Specialized Services' },
  ];

  return (
    <section className="bg-offwhite py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={cn(
                'relative',
                i < stats.length - 1 && 'lg:border-r lg:border-border'
              )}
            >
              <StatItem {...stat} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
