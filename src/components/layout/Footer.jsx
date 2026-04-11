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
                { label: 'Blog', href: '/blog' },
                { label: 'Guides', href: '/guides' },
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
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-white/[0.08] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-sm text-white/60">
            &copy; {new Date().getFullYear()} American Resources. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
