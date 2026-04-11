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
        title="Atlanta's Full-Service Industrial Recycling & Scrap Removal"
        subtitle="We collect metal, paper, electronics, and end-of-life equipment from your facility — on your schedule, fully documented."
        buttons={[
          { label: 'Book a Free Site Assessment', variant: 'primary', href: '/contact', arrow: true },
        ]}
        trustLine="Serving 200+ Atlanta businesses for over 20 years · 15,000+ tons recycled annually"
      />
      <Testimonials />
      <ServiceGallery />
      <WhyChooseUs />
      <BlogPreview />
      <FinalCTA />
    </>
  );
}
