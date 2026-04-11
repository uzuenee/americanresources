'use client';
import Link from 'next/link';
import Image from 'next/image';
import { services } from '@/data/services';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';
import { Eyebrow } from '@/components/ui/Eyebrow';

export function RelatedServices({ slugs = [] }) {
  const related = slugs
    .map((slug) => services.find((s) => s.slug === slug))
    .filter(Boolean);

  if (related.length === 0) return null;

  return (
    <section className="bg-offwhite py-24 md:py-30 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        <Eyebrow>YOU MIGHT ALSO NEED</Eyebrow>
        <AnimateOnScroll>
          <h2 className="font-serif text-3xl md:text-4xl text-text-primary leading-[1.1] mt-4 mb-12">
            Related Services
          </h2>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {related.map((service, i) => (
            <AnimateOnScroll key={service.slug} delay={i * 0.1}>
              <Link href={`/services/${service.slug}`} className="group block">
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-5">
                  <Image
                    src={service.heroImage}
                    alt={service.title}
                    fill
                    className="object-cover editorial-image transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <h3 className="font-serif text-xl text-text-primary group-hover:text-navy-light transition-colors">
                  {service.title}
                </h3>
                <p className="font-sans text-sm text-text-muted mt-2 line-clamp-2">
                  {service.tagline}
                </p>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
