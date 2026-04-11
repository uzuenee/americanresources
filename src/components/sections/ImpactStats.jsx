'use client';
import { useCounter } from '@/hooks/useCounter';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';

function ImpactStat({ value, prefix = '', suffix = '', label, decimals = 0 }) {
  const numericValue = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  const { ref, count } = useCounter(numericValue);

  const display = decimals > 0
    ? count.toFixed(decimals)
    : count.toLocaleString();

  return (
    <div ref={ref} className="text-center">
      <div className="font-serif text-5xl md:text-6xl lg:text-7xl text-white tracking-tight">
        {prefix}{display}{suffix}
      </div>
      <p className="font-sans text-base text-white/60 mt-3 max-w-[280px] mx-auto leading-relaxed">
        {label}
      </p>
    </div>
  );
}

export function ImpactStats() {
  return (
    <section className="relative bg-navy-dark py-24 md:py-32 lg:py-40 overflow-hidden">
      {/* Subtle radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(46,74,122,0.15)_0%,_transparent_70%)]" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-16 text-center">
        <Eyebrow dark center>OUR IMPACT</Eyebrow>
        <AnimateOnScroll>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white leading-[1.1] mt-4 mb-16">
            Building a Greener Atlanta,
            <br />
            One Ton at a Time
          </h2>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <ImpactStat value={15000} suffix="+" label="Tons of Material Diverted from Landfills Annually" />
          <ImpactStat value={850} suffix="+" label="Tons of CO&#x2082; Emissions Prevented" />
          <ImpactStat value={200} suffix="+" label="Atlanta Businesses Advancing Their Sustainability Goals" />
        </div>

        {/* Quote */}
        <AnimateOnScroll delay={0.3}>
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-10 bg-accent mb-6" aria-hidden="true" />
            <blockquote className="font-serif italic text-xl md:text-2xl text-white/70 max-w-2xl leading-relaxed">
              &ldquo;Every ton we recycle is a ton that doesn&apos;t end up in a landfill.&rdquo;
            </blockquote>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
