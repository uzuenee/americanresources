import { Hero } from '@/components/sections/Hero';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for American Resources — how we collect, use, and protect your information.',
};

export default function PrivacyPage() {
  return (
    <>
      <Hero
        height="compact"
        light
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Privacy Policy' },
        ]}
        title="Privacy Policy"
      />

      <section className="bg-offwhite py-12 md:py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-16">
          <div className="prose-brand space-y-6 font-sans text-[0.9375rem] leading-relaxed text-text-primary">
            <p className="text-text-muted">Last updated: April 2026</p>

            <h2 className="font-serif text-[1.5rem] font-semibold text-text-primary">1. Information We Collect</h2>
            <p>
              When you create a portal account or submit a contact form, we collect information you provide directly:
              your name, company name, email address, phone number, and pickup address. We also collect service-related
              data such as pickup requests, material weights, and scheduling preferences.
            </p>

            <h2 className="font-serif text-[1.5rem] font-semibold text-text-primary">2. How We Use Your Information</h2>
            <p>
              We use your information to provide recycling services, schedule pickups, communicate about your account,
              send transactional emails (confirmations, scheduling updates), and generate impact reports. We do not sell
              or share your personal information with third parties for marketing purposes.
            </p>

            <h2 className="font-serif text-[1.5rem] font-semibold text-text-primary">3. Data Storage and Security</h2>
            <p>
              Your data is stored securely using industry-standard encryption. Account credentials are managed through
              our authentication provider with bcrypt password hashing. We retain your data for the duration of your
              account and as required by applicable regulations.
            </p>

            <h2 className="font-serif text-[1.5rem] font-semibold text-text-primary">4. Cookies and Analytics</h2>
            <p>
              We use essential cookies for authentication and session management. These cookies are necessary for the
              customer portal to function. We also use Google Analytics to understand how visitors interact with our
              website. Google Analytics collects anonymized usage data such as pages visited, time spent on the site,
              and general device and browser information. This data helps us improve our services and website
              experience. We do not use advertising networks or sell any data collected through analytics.
            </p>

            <h2 className="font-serif text-[1.5rem] font-semibold text-text-primary">5. Email Communications</h2>
            <p>
              We send transactional emails related to your account and services: signup confirmation, password resets,
              pickup scheduling notifications, and load completion summaries. These are service communications, not
              marketing emails, and cannot be unsubscribed from while your account is active.
            </p>

            <h2 className="font-serif text-[1.5rem] font-semibold text-text-primary">6. Your Rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal data by contacting us. Account
              deletion will remove your portal access and personal information, subject to any legal retention
              requirements.
            </p>

            <h2 className="font-serif text-[1.5rem] font-semibold text-text-primary">7. Contact</h2>
            <p>
              For privacy-related inquiries, contact us at{' '}
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
