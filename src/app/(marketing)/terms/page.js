import { Hero } from '@/components/sections/Hero';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for American Resources recycling services and customer portal.',
};

export default function TermsPage() {
  return (
    <>
      <Hero
        height="compact"
        light
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Terms of Service' },
        ]}
        title="Terms of Service"
      />

      <section className="bg-offwhite py-12 md:py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-16">
          <div className="prose-brand space-y-6 font-sans text-[0.9375rem] leading-relaxed text-text-primary">
            <p className="text-text-muted">Last updated: April 2026</p>

            <h2 className="font-serif text-[1.5rem] font-semibold text-text-primary">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the American Resources website and customer portal, you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>

            <h2 className="font-serif text-[1.5rem] font-semibold text-text-primary">2. Services</h2>
            <p>
              American Resources provides recycling and waste management services including environmental consulting,
              paper shredding, scrap metal recycling, electronics recycling, appliance recycling, and automobile
              recycling. Service availability, pricing, and scheduling are subject to change.
            </p>

            <h2 className="font-serif text-[1.5rem] font-semibold text-text-primary">3. Customer Portal</h2>
            <p>
              Access to the customer portal requires an account. You are responsible for maintaining the confidentiality
              of your login credentials and for all activity that occurs under your account. You agree to notify us
              immediately of any unauthorized use.
            </p>

            <h2 className="font-serif text-[1.5rem] font-semibold text-text-primary">4. Pickup Requests</h2>
            <p>
              Pickup requests submitted through the portal are subject to scheduling availability and confirmation by
              our dispatch team. Submitted requests are not guaranteed until confirmed. Estimated weights and preferred
              dates are approximate and may be adjusted.
            </p>

            <h2 className="font-serif text-[1.5rem] font-semibold text-text-primary">5. Pricing and Payment</h2>
            <p>
              Pricing for services is determined based on material type, volume, frequency, and applicable market rates.
              For scrap materials with recovery value, payment is based on certified weighing at our facility. All
              pricing is provided in writing before service begins.
            </p>

            <h2 className="font-serif text-[1.5rem] font-semibold text-text-primary">6. Limitation of Liability</h2>
            <p>
              American Resources shall not be liable for any indirect, incidental, or consequential damages arising from
              the use of our services or this website. Our liability is limited to the value of services provided.
            </p>

            <h2 className="font-serif text-[1.5rem] font-semibold text-text-primary">7. Contact</h2>
            <p>
              For questions about these terms, contact us at{' '}
              <a href="mailto:info@recyclinggroup.com" className="text-navy-light underline">
                info@recyclinggroup.com
              </a>{' '}
              or call{' '}
              <a href="tel:+17709348248" className="text-navy-light underline">
                (770) 934-8248
              </a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
