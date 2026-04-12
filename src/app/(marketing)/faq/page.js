'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Hero } from '@/components/sections/Hero';
import { FAQAccordion } from '@/components/sections/FAQAccordion';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';
import { faqCategories } from '@/data/faq';
import { companyInfo } from '@/data/companyInfo';
import { cn } from '@/utils/cn';

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      <Hero
        height="compact"
        light
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'FAQ' },
        ]}
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about our recycling services, pricing, and processes."
      />

      <section className="bg-offwhite py-12 md:py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-16">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-3 mb-12">
            {faqCategories.map((cat, i) => (
              <button
                key={cat.category}
                onClick={() => setActiveTab(i)}
                className={cn(
                  'font-sans text-sm font-medium px-5 py-2 rounded-full transition-all duration-200 cursor-pointer',
                  activeTab === i
                    ? 'bg-navy text-white'
                    : 'bg-transparent border border-border text-text-muted hover:border-navy/30 hover:text-text-primary'
                )}
              >
                {cat.category}
              </button>
            ))}
          </div>

          {/* FAQ content */}
          <AnimateOnScroll>
            <h2 className="font-serif text-2xl md:text-3xl text-text-primary mb-8">
              {faqCategories[activeTab].category}
            </h2>
          </AnimateOnScroll>
          <FAQAccordion items={faqCategories[activeTab].questions} />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <AnimateOnScroll>
            <h2 className="font-serif text-2xl md:text-3xl text-text-primary mb-4">
              Still have questions?
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.1}>
            <p className="font-sans text-lg text-text-muted mb-6">
              Contact us directly and we&apos;ll be happy to help.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-accent text-white font-sans font-semibold text-base px-8 py-3.5 rounded-lg hover:bg-accent-hover transition-all duration-200"
              >
                Contact Us
              </Link>
              <a
                href={companyInfo.phoneHref}
                className="inline-flex items-center justify-center gap-2 border border-navy text-navy font-sans font-semibold text-base px-8 py-3.5 rounded-lg hover:bg-navy hover:text-white transition-all duration-200"
              >
                {companyInfo.phone}
              </a>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
