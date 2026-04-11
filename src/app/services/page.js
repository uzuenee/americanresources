import { Hero } from '@/components/sections/Hero';
import { ServiceGallery } from '@/components/sections/ServiceGallery';
import { FinalCTA } from '@/components/sections/FinalCTA';

export const metadata = {
  title: 'Our Services',
  description:
    'Comprehensive recycling solutions for every waste stream your business generates. Environmental consulting, paper shredding, scrap metal, electronics, appliance & auto recycling.',
};

export default function ServicesHubPage() {
  return (
    <>
      <Hero
        height="short"
        backgroundImage="/images/hero-services.jpeg"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Services' },
        ]}
        title="Our Services"
        subtitle="Comprehensive recycling solutions for every waste stream your business generates."
      />
      <ServiceGallery expanded />
      <FinalCTA />
    </>
  );
}
