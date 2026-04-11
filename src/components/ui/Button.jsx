import Link from 'next/link';
import { cn } from '@/utils/cn';

const variants = {
  primary:
    'bg-accent text-white hover:bg-accent-hover shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200',
  secondary:
    'border border-white text-white hover:bg-white hover:text-text-primary active:bg-white/90 transition-all duration-200',
  'secondary-dark':
    'border border-navy text-navy hover:bg-navy hover:text-white active:bg-navy/90 transition-all duration-200',
  white:
    'bg-white text-navy hover:bg-offwhite active:bg-white/90 transition-all duration-200',
};

export function Button({
  children,
  variant = 'primary',
  href,
  className,
  arrow,
  ...props
}) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 font-sans font-semibold text-[15px] tracking-[0.03em] px-8 py-4 rounded-lg cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-light',
    variants[variant],
    className
  );

  const content = (
    <>
      {children}
      {arrow && <span className="text-lg transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">&rarr;</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn(classes, 'group')} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button className={cn(classes, 'group')} {...props}>
      {content}
    </button>
  );
}
