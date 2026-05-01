import Link from 'next/link';
import Image from 'next/image';
import { companyInfo } from '@/data/companyInfo';
import { services } from '@/data/services';

export function Footer() {
  return (
    <footer className="bg-navy-dark border-t-2 border-accent/20">
      <div className="mx-auto max-w-7xl px-6 lg:px-16 pt-20 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div>
            <Image
              src="/American-Resources_realLogo.webp"
              alt="American Resources"
              width={160}
              height={45}
              className="h-10 w-auto mb-5"
            />
            <p className="font-sans text-sm text-white/60 leading-relaxed mb-6">
              Atlanta&apos;s trusted partner for commercial recycling and environmental waste management since 2005.
            </p>
            <div className="space-y-2 text-sm">
              <a href={companyInfo.phoneHref} className="block text-navy-pale hover:text-white transition-colors">
                {companyInfo.phone}
              </a>
              <a href={`mailto:${companyInfo.email}`} className="block text-navy-pale/70 hover:text-white transition-colors">
                {companyInfo.email}
              </a>
              <p className="text-white/60">{companyInfo.address.full}</p>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif text-lg text-navy-pale mb-5">Services</h4>
            <ul className="space-y-2.5">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="font-sans text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {service.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-serif text-lg text-navy-pale mb-5">Resources</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Customer Portal', href: '/login' },
                { label: 'Guides', href: '/guides' },
                { label: 'Blog', href: '/blog' },
                { label: 'FAQ', href: '/faq' },
                { label: 'About', href: '/about' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-serif text-lg text-navy-pale mb-5">Connect</h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/contact"
                  className="font-sans text-sm text-white/60 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="font-sans text-sm text-white/60 hover:text-white transition-colors"
                >
                  Schedule a Pickup
                </Link>
              </li>
            </ul>
            <div className="mt-5 flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-white/[0.08] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-sm text-white/60">
            &copy; {new Date().getFullYear()} American Resources. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              className="font-sans text-sm text-white/60 hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <span className="text-white/30" aria-hidden="true">&middot;</span>
            <Link
              href="/privacy"
              className="font-sans text-sm text-white/60 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
