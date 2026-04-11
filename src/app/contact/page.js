import Link from 'next/link';
import { Hero } from '@/components/sections/Hero';
import { ContactForm } from '@/components/sections/ContactForm';
import { FAQAccordion } from '@/components/sections/FAQAccordion';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { companyInfo } from '@/data/companyInfo';
import { faqCategories } from '@/data/faq';

export const metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with American Resources for a free recycling consultation. Request a quote for scrap metal, paper shredding, electronics recycling, and more.',
};

export default function ContactPage() {
  const topFaqs = faqCategories[0].questions.slice(0, 4);

  return (
    <>
      <Hero
        height="compact"
        light
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Contact' },
        ]}
        title="Get in Touch"
        subtitle="Ready to start recycling smarter? We'd love to hear from you."
      />

      {/* Contact Split */}
      <section className="bg-offwhite pb-16 md:pb-24 lg:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Form */}
            <div className="lg:col-span-7">
              <AnimateOnScroll>
                <h2 className="font-serif text-2xl md:text-3xl text-text-primary mb-8">
                  Send Us a Message
                </h2>
              </AnimateOnScroll>
              <ContactForm />
            </div>

            {/* Info */}
            <div className="lg:col-span-5">
              <AnimateOnScroll delay={0.15}>
                <div className="bg-offwhite-alt rounded-2xl p-8 md:p-10">
                  <h3 className="font-serif text-xl text-text-primary mb-6">
                    Contact Information
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <p className="font-sans text-sm font-medium text-text-muted uppercase tracking-wider mb-1">
                        Phone
                      </p>
                      <a
                        href={companyInfo.phoneHref}
                        className="font-sans text-xl font-semibold text-text-primary hover:text-accent transition-colors"
                      >
                        {companyInfo.phone}
                      </a>
                    </div>

                    <div>
                      <p className="font-sans text-sm font-medium text-text-muted uppercase tracking-wider mb-1">
                        Email
                      </p>
                      <a
                        href={`mailto:${companyInfo.email}`}
                        className="font-sans text-base text-text-primary hover:text-accent transition-colors"
                      >
                        {companyInfo.email}
                      </a>
                    </div>

                    <div>
                      <p className="font-sans text-sm font-medium text-text-muted uppercase tracking-wider mb-1">
                        Address
                      </p>
                      <p className="font-sans text-base text-text-primary">
                        {companyInfo.address.full}
                      </p>
                    </div>

                    <div>
                      <p className="font-sans text-sm font-medium text-text-muted uppercase tracking-wider mb-1">
                        Hours
                      </p>
                      <p className="font-sans text-base text-text-primary">
                        {companyInfo.hours}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-16">
          <Eyebrow center>COMMON QUESTIONS</Eyebrow>
          <AnimateOnScroll>
            <h2 className="font-serif text-2xl md:text-3xl text-text-primary leading-[1.15] mt-4 mb-8 text-center">
              Quick Answers
            </h2>
          </AnimateOnScroll>
          <FAQAccordion items={topFaqs} />
          <div className="text-center mt-8">
            <Link
              href="/faq"
              className="font-sans text-base text-navy-light hover:underline group"
            >
              See all FAQs <span className="inline-block transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
