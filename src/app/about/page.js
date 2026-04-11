import Image from 'next/image';
import { Hero } from '@/components/sections/Hero';
import { SectionWrapper } from '@/components/ui/SectionWrapper';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';
import { TrustBar } from '@/components/sections/TrustBar';
import { FinalCTA } from '@/components/sections/FinalCTA';

export const metadata = {
  title: 'About Us',
  description:
    "Learn about American Resources — Atlanta's trusted recycling partner since 2005. Over two decades of experience serving 200+ businesses across the metro area.",
};

const values = [
  {
    number: '01',
    title: 'Integrity',
    description:
      'We do what we say. Every pickup on time, every material processed responsibly, every report accurate. Our word is our contract.',
  },
  {
    number: '02',
    title: 'Sustainability',
    description:
      'Every decision we make is weighed against its environmental impact. We exist to keep materials in use and out of landfills.',
  },
  {
    number: '03',
    title: 'Partnership',
    description:
      "Your success is our success. We invest in understanding your business because one-size-fits-all recycling doesn't work.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Hero
        height="shorter"
        light
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'About Us' },
        ]}
        title="About American Resources"
        subtitle="Atlanta's trusted recycling partner since 2005."
      />

      {/* Our Story */}
      <SectionWrapper innerClassName="pt-0 md:pt-0 lg:pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Eyebrow>OUR STORY</Eyebrow>
            <AnimateOnScroll>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-[44px] text-text-primary leading-[1.15] mt-4 mb-8">
                More Than a Recycling Company
              </h2>
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.1}>
              <p className="font-sans text-base md:text-lg text-text-muted leading-relaxed mb-5">
                American Resources was founded with a simple conviction: that responsible recycling isn&apos;t just good for the environment &mdash; it&apos;s good for business. For over two decades, we&apos;ve helped Atlanta&apos;s leading organizations turn their waste streams into sustainable value.
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.15}>
              <p className="font-sans text-base md:text-lg text-text-muted leading-relaxed mb-5">
                What started as a scrap metal operation has grown into a full-service environmental waste management partner. Today, we offer six specialized recycling services, serving over 200 businesses across the Atlanta metro area &mdash; from single-location offices to multi-site industrial operations.
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.2}>
              <p className="font-sans text-base md:text-lg text-text-muted leading-relaxed">
                Our approach is different. We don&apos;t just haul your waste away. We analyze your waste streams, design custom recycling programs, ensure regulatory compliance, and maximize the recovery value of your materials. We&apos;re a partner in your sustainability strategy, not just a vendor on your invoice.
              </p>
            </AnimateOnScroll>
          </div>
          <div className="lg:col-span-5">
            <AnimateOnScroll delay={0.2}>
              <div className="relative h-[400px] lg:h-full min-h-[500px] rounded-2xl overflow-hidden">
                <Image
                  src="/images/about/building.jpeg"
                  alt="American Resources facility exterior"
                  fill
                  className="object-cover editorial-image"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </SectionWrapper>

      {/* Values */}
      <SectionWrapper dark>
        <div className="text-center mb-16">
          <Eyebrow dark center>OUR VALUES</Eyebrow>
          <AnimateOnScroll>
            <h2 className="font-serif text-3xl md:text-4xl text-white leading-[1.1] mt-4">
              What Drives Us
            </h2>
          </AnimateOnScroll>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {values.map((value, i) => (
            <AnimateOnScroll key={value.number} delay={i * 0.1}>
              <div className="text-center md:text-left">
                <span className="font-serif italic text-6xl text-white/10 leading-none">
                  {value.number}
                </span>
                <h3 className="font-serif text-2xl md:text-[28px] text-white mt-2 mb-3">
                  {value.title}
                </h3>
                <p className="font-sans text-base text-white/70 leading-relaxed max-w-[360px] mx-auto md:mx-0">
                  {value.description}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </SectionWrapper>

      {/* Stats */}
      <section className="bg-offwhite py-24 md:py-30">
        <div className="mx-auto max-w-7xl px-6 lg:px-16 text-center mb-12">
          <Eyebrow center>BY THE NUMBERS</Eyebrow>
          <AnimateOnScroll>
            <h2 className="font-serif text-3xl md:text-4xl text-text-primary leading-[1.1] mt-4">
              Our Impact in Numbers
            </h2>
          </AnimateOnScroll>
        </div>
        <TrustBar />
      </section>

      {/* Service Area */}
      <SectionWrapper innerClassName="pt-0 md:pt-0 lg:pt-0">
        <div className="max-w-3xl mx-auto text-center">
          <Eyebrow center>SERVICE AREA</Eyebrow>
          <AnimateOnScroll>
            <h2 className="font-serif text-3xl md:text-4xl text-text-primary leading-[1.1] mt-4 mb-6">
              Proudly Serving the Atlanta Metro Area
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.1}>
            <p className="font-sans text-lg text-text-muted leading-relaxed">
              We serve businesses throughout the greater Atlanta metropolitan area, including Buckhead, Midtown, Downtown, Decatur, Marietta, Roswell, Sandy Springs, and surrounding communities.
            </p>
          </AnimateOnScroll>
        </div>
      </SectionWrapper>

      <FinalCTA />
    </>
  );
}
