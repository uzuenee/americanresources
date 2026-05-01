'use client';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';

const defaultSteps = [
  {
    number: '01',
    title: 'Consultation',
    description:
      "Tell us about your business and waste streams. We'll assess your needs and design a custom recycling program.",
  },
  {
    number: '02',
    title: 'Custom Plan',
    description:
      'Receive a detailed proposal with service recommendations, scheduling, pricing, and projected environmental impact.',
  },
  {
    number: '03',
    title: 'Scheduled Service',
    description:
      'We handle pickups on your schedule — weekly, bi-weekly, or on-demand. Minimal disruption to your operations.',
  },
  {
    number: '04',
    title: 'Reporting & Optimization',
    description:
      'Track your environmental impact with regular reports. We continuously optimize to maximize material recovery and minimize waste.',
  },
];

export function ProcessSteps({ steps = defaultSteps }) {
  return (
    <section className="bg-offwhite-alt py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        <div className="text-center mb-16">
          <Eyebrow center>THE PROCESS</Eyebrow>
          <AnimateOnScroll>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-text-primary leading-[1.1] mt-4">
              From First Call to First Pickup
            </h2>
          </AnimateOnScroll>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-0.5 border-t-2 border-dashed border-accent/60" aria-hidden="true" />

          {steps.map((step, i) => (
            <AnimateOnScroll key={step.number} delay={i * 0.15}>
              <div className="relative text-center lg:text-left">
                <span className="font-serif italic text-7xl md:text-8xl text-navy-pale leading-none" aria-hidden="true">
                  {step.number}
                </span>
                <h3 className="font-serif text-2xl text-text-primary mt-2">
                  {step.title}
                </h3>
                <p className="font-sans text-base text-text-muted leading-relaxed mt-3 max-w-[16.25rem] mx-auto lg:mx-0">
                  {step.description}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
