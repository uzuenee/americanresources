'use client';
import Image from 'next/image';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';

const differentiators = [
  {
    number: '01',
    title: 'Proven Expertise',
    description:
      'Two decades of experience managing recycling programs for businesses of every size, from single-location restaurants to multi-site industrial operations.',
  },
  {
    number: '02',
    title: 'Full-Service Solutions',
    description:
      'Six specialized recycling services under one roof. One partner, one invoice, one relationship for all your waste management needs.',
  },
  {
    number: '03',
    title: 'Regulatory Compliance',
    description:
      "We stay current with Georgia's environmental regulations so you don't have to. Every pickup, every process, fully compliant and documented.",
  },
  {
    number: '04',
    title: 'Environmental Stewardship',
    description:
      'Every ton we process is diverted from the landfill and returned to the supply chain. We document tons diverted and CO₂ prevented, giving you real numbers to back your ESG and sustainability reporting.',
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-offwhite pt-24 md:pt-32 lg:pt-40 pb-16 md:pb-20 lg:pb-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        {/* Copper transition line from dark section above */}
        <div className="w-20 h-0.5 bg-copper/40 mb-16 lg:mb-20" aria-hidden="true" />

        {/* Full-width header — no eyebrow, direct statement */}
        <div className="max-w-3xl mb-14 lg:mb-20">
          <AnimateOnScroll>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-[3.25rem] text-text-primary leading-[1.08]">
              As committed to your success as we are to the planet
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.1}>
            <p className="font-sans text-lg text-text-muted leading-relaxed mt-6 max-w-xl">
              For over two decades, we&apos;ve helped Atlanta&apos;s leading businesses transform their waste management from a cost center into a sustainability advantage.
            </p>
          </AnimateOnScroll>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Left: image — placed first visually on desktop for asymmetry */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <AnimateOnScroll delay={0.15}>
              <div className="relative h-[25rem] lg:h-full min-h-[30rem] rounded-2xl overflow-hidden">
                <Image
                  src="/images/about/warehouse.jpeg"
                  alt="Recycling warehouse interior with workers sorting materials"
                  fill
                  className="object-cover editorial-image"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              </div>
              {/* Copper accent detail */}
              <div className="absolute -bottom-3 -left-3 w-1/2 h-1/2 border-2 border-copper/15 rounded-2xl -z-10" aria-hidden="true" />
            </AnimateOnScroll>
          </div>

          {/* Right: differentiators with prominent numbering */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="space-y-10 lg:space-y-12">
              {differentiators.map((item, i) => (
                <AnimateOnScroll key={item.number} delay={0.1 + i * 0.08}>
                  <div className="flex gap-6">
                    <span className="font-mono text-3xl lg:text-4xl text-copper/30 leading-none flex-shrink-0 mt-1" aria-hidden="true">
                      {item.number}
                    </span>
                    <div>
                      <h3 className="font-serif text-xl md:text-2xl text-text-primary leading-tight">
                        {item.title}
                      </h3>
                      <p className="font-sans text-base text-text-muted leading-relaxed mt-2">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
