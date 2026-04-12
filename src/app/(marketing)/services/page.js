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
        blurDataURL="data:image/jpeg;base64,/9j/2wBDACgcHiMeGSgjISMtKygwPGRBPDc3PHtYXUlkkYCZlo+AjIqgtObDoKrarYqMyP/L2u71////m8H////6/+b9//j/2wBDASstLTw1PHZBQXb4pYyl+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj/wAARCAAJABADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAwAC/8QAHhAAAQMEAwAAAAAAAAAAAAAAAQACAwQRMnEhIlH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAv/EABcRAAMBAAAAAAAAAAAAAAAAAAABERL/2gAMAwEAAhEDEQA/AIVXFmxA6ckM9h2Y1pPpWIcENVlHtTpwQ//Z"
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
