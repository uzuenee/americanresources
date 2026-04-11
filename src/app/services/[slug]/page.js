import { notFound } from 'next/navigation';
import Image from 'next/image';
import { services } from '@/data/services';
import { Hero } from '@/components/sections/Hero';
import { SectionWrapper } from '@/components/ui/SectionWrapper';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';
import { FAQAccordion } from '@/components/sections/FAQAccordion';
import { RelatedServices } from '@/components/sections/RelatedServices';
import { FinalCTA } from '@/components/sections/FinalCTA';

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return {};
  return {
    title: service.title,
    description: service.tagline,
  };
}

export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  return (
    <>
      {/* Hero */}
      <Hero
        height="medium"
        backgroundImage={service.heroImage}
        blurDataURL={service.heroBlurDataURL}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Services', href: '/services' },
          { label: service.shortTitle },
        ]}
        title={service.title}
        subtitle={service.tagline}
        buttons={[
          { label: `Get a Quote for ${service.shortTitle}`, variant: 'primary', href: '/contact', arrow: true },
        ]}
      />

      {/* Description */}
      <SectionWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Eyebrow>ABOUT THIS SERVICE</Eyebrow>
            <AnimateOnScroll>
              <h2 className="font-serif text-3xl md:text-4xl text-text-primary leading-[1.15] mt-4 mb-8">
                What is {service.shortTitle}?
              </h2>
            </AnimateOnScroll>
            {service.description.map((paragraph, i) => (
              <AnimateOnScroll key={i} delay={0.1 + i * 0.08}>
                <p className="font-sans text-base md:text-lg text-text-muted leading-relaxed mb-5">
                  {paragraph}
                </p>
              </AnimateOnScroll>
            ))}
          </div>
          <div className="lg:col-span-5">
            <AnimateOnScroll delay={0.2}>
              <div className="relative h-[300px] lg:h-full min-h-[400px] rounded-2xl overflow-hidden">
                <Image
                  src={service.galleryImage}
                  alt={service.title}
                  fill
                  className="object-cover editorial-image"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </SectionWrapper>

      {/* Benefits */}
      <section className="bg-offwhite-alt py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-16">
          <Eyebrow>KEY BENEFITS</Eyebrow>
          <AnimateOnScroll>
            <h2 className="font-serif text-3xl md:text-4xl text-text-primary leading-[1.15] mt-4 mb-12">
              Why {service.shortTitle}?
            </h2>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {service.benefits.map((benefit, i) => (
              <AnimateOnScroll key={i} delay={i * 0.08}>
                <div>
                  <span className="font-sans text-sm text-accent font-medium">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="w-8 h-0.5 bg-accent mt-2 mb-3" />
                  <h3 className="font-serif text-xl text-text-primary mb-2">
                    {benefit.title}
                  </h3>
                  <p className="font-sans text-base text-text-muted leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <SectionWrapper dark>
        <Eyebrow dark>WHY AMERICAN RESOURCES</Eyebrow>
        <AnimateOnScroll>
          <h2 className="font-serif text-3xl md:text-4xl text-white leading-[1.15] mt-4 mb-12">
            The American Resources Difference
          </h2>
        </AnimateOnScroll>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {service.differentiators.map((diff, i) => (
            <AnimateOnScroll key={i} delay={i * 0.1}>
              <div className="relative pl-6 border-l-2 border-navy-light">
                <h3 className="font-serif text-xl text-white mb-2">
                  {diff.title}
                </h3>
                <p className="font-sans text-base text-text-on-dark/70 leading-relaxed">
                  {diff.description}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </SectionWrapper>

      {/* FAQ */}
      <SectionWrapper>
        <div className="max-w-3xl mx-auto">
          <Eyebrow center>FREQUENTLY ASKED</Eyebrow>
          <AnimateOnScroll>
            <h2 className="font-serif text-3xl md:text-4xl text-text-primary leading-[1.15] mt-4 mb-10 text-center">
              {service.shortTitle} FAQ
            </h2>
          </AnimateOnScroll>
          <FAQAccordion items={service.faq} />
        </div>
      </SectionWrapper>

      {/* Related Services */}
      <RelatedServices slugs={service.relatedSlugs} />

      {/* CTA */}
      <FinalCTA
        headline={`Ready to Get Started with\n${service.shortTitle}?`}
        buttonText={`Request a ${service.shortTitle} Quote`}
      />
    </>
  );
}
