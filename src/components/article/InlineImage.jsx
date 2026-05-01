import Image from 'next/image';
import { cn } from '@/utils/cn';

const variantStyles = {
  column: 'my-12',
  wide: 'my-14',
  'full-bleed':
    'relative left-1/2 my-20 w-screen max-w-[1600px] -translate-x-1/2',
};

export function InlineImage({
  src,
  alt,
  variant = 'column',
  caption,
  credit,
  priority = false,
}) {
  const isFullBleed = variant === 'full-bleed';

  return (
    <figure className={cn(variantStyles[variant])}>
      <div
        className={cn(
          'relative overflow-hidden rounded-sm',
          isFullBleed ? 'aspect-video max-h-screen' : 'aspect-[16/10]'
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={
            isFullBleed
              ? '100vw'
              : variant === 'wide'
                ? '(min-width: 1024px) 840px, 100vw'
                : '(min-width: 768px) 680px, 100vw'
          }
          className="editorial-image object-cover"
          priority={priority}
        />
        {/* warm grade overlay — half intensity of hero */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 30% 40%, rgba(196,149,106,0.05) 0%, transparent 60%)',
          }}
          aria-hidden="true"
        />
      </div>

      {(caption || credit) && (
        <figcaption
          className={cn(
            'mt-3 font-sans text-sm italic text-text-muted',
            isFullBleed && 'mx-auto max-w-[1180px] px-8'
          )}
        >
          {caption}
          {caption && credit && (
            <span className="mx-1.5 font-semibold not-italic text-copper">
              &middot;
            </span>
          )}
          {credit && (
            <span className="text-xs font-normal uppercase tracking-wider not-italic">
              {credit}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
