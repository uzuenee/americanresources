import Image from 'next/image';
import { Hero } from '@/components/sections/Hero';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';
import { guides } from '@/data/guides';

export const metadata = {
  title: 'Blog',
  description:
    "In-depth guides to help your business navigate waste management, compliance, and sustainability in the Atlanta metro area.",
};

export default function GuidesListingPage() {
  return (
    <>
      <Hero
        height="compact"
        light
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Blog' },
        ]}
        title="Recycling Resources"
        subtitle="In-depth articles to help your business navigate waste management, compliance, and sustainability."
      />

      <section className="bg-offwhite pb-12 md:pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-16 space-y-8">
          {guides.map((guide, i) => (
            <AnimateOnScroll key={guide.slug} delay={i * 0.1}>
              <article className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                  <div className="md:col-span-4 relative aspect-[16/10] md:aspect-auto">
                    <Image
                      src={guide.image}
                      alt={guide.title}
                      fill
                      className="object-cover editorial-image"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="md:col-span-8 p-8 md:p-10 flex flex-col justify-center">
                    <h2 className="font-serif text-xl md:text-2xl text-text-primary leading-tight">
                      {guide.title}
                    </h2>
                    <p className="font-sans text-base text-text-muted leading-relaxed mt-3 line-clamp-3">
                      {guide.description}
                    </p>
                    <div className="mt-5">
                      <span className="font-sans text-sm text-text-muted/60">
                        {guide.readTime}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </AnimateOnScroll>
          ))}
        </div>
      </section>
    </>
  );
}
