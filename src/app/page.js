import { Hero } from '@/components/sections/Hero';
import { ServiceGallery } from '@/components/sections/ServiceGallery';
import { WhyChooseUs } from '@/components/sections/WhyChooseUs';
import { Testimonials } from '@/components/sections/TestimonialCarousel';
import { BlogPreview } from '@/components/sections/BlogPreview';
import { FinalCTA } from '@/components/sections/FinalCTA';

export default function HomePage() {
  return (
    <>
      <Hero
        height="full"
        backgroundImage="/images/hero-home.jpeg"
        eyebrow="ATLANTA'S TRUSTED RECYCLING PARTNER"
        title={<>Waste Into<br />Opportunity</>}
        subtitle="American Resources partners with Atlanta businesses to turn manufacturing waste, scrap metal, and end-of-life equipment into sustainable value."
        buttons={[
          { label: 'Request a Consultation', variant: 'primary', href: '/contact', arrow: true },
          { label: 'Explore Our Services', variant: 'secondary', href: '/services' },
        ]}
        stats={[
          { value: 20, suffix: '+', label: 'Years Experience' },
          { value: 200, suffix: '+', label: 'Business Partners' },
          { value: 15000, suffix: '+', label: 'Tons Recycled Annually' },
        ]}
      />
      <Testimonials />
      <ServiceGallery />
      <WhyChooseUs />
      <BlogPreview />
      <FinalCTA />
    </>
  );
}
