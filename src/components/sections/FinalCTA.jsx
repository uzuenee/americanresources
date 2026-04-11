'use client';
import { Button } from '@/components/ui/Button';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';
import { companyInfo } from '@/data/companyInfo';

export function FinalCTA({
  headline = 'Ready to Turn Your Waste\nInto Opportunity?',
  subtitle = 'Get a free consultation and custom recycling plan for your business. No obligation, no pressure — just solutions.',
  buttonText = 'Request Your Free Consultation',
}) {
  return (
    <section className="relative bg-navy-dark pt-16 md:pt-20 lg:pt-28 pb-20 md:pb-28 lg:pb-36 overflow-hidden">
      {/* Subtle radial gradient — offset to the right for asymmetry */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,_rgba(196,149,106,0.08)_0%,_transparent_60%)]" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          {/* Left: text content — left-aligned, not centered */}
          <div className="lg:col-span-8">
            <AnimateOnScroll>
              <div className="w-16 h-1 bg-copper mb-10" aria-hidden="true" />
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl xl:text-[3.5rem] text-white leading-[1.1] whitespace-pre-line">
                {headline}
              </h2>
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.1}>
              <p className="font-sans text-lg md:text-xl text-white/60 leading-relaxed mt-6 max-w-[33.75rem]">
                {subtitle}
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.2}>
              <div className="flex flex-wrap items-center gap-6 mt-10">
                <Button
                  href="/contact"
                  variant="primary"
                  arrow
                  className="text-base md:text-lg px-10 md:px-12 py-4 md:py-5 rounded-xl"
                >
                  {buttonText}
                </Button>
                <a
                  href={companyInfo.phoneHref}
                  className="inline-flex items-center gap-2 font-sans text-base text-white/60 hover:text-white/80 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {companyInfo.phone}
                </a>
              </div>
            </AnimateOnScroll>
          </div>

          {/* Right: decorative large number — adds asymmetric visual weight */}
          <div className="hidden lg:block lg:col-span-4 text-right" aria-hidden="true">
            <span className="font-mono text-[10rem] xl:text-[12.5rem] leading-none text-copper/[0.06] select-none">
              20+
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
