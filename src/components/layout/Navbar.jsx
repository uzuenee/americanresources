'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { cn } from '@/utils/cn';
import { services } from '@/data/services';
import { companyInfo } from '@/data/companyInfo';
import { MobileMenu } from './MobileMenu';

const navLinks = [
  {
    label: 'Services',
    href: '/services',
    dropdown: services.map((s) => ({ label: s.shortTitle, href: `/services/${s.slug}` })),
  },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Guides', href: '/guides' },
  { label: 'FAQ', href: '/faq' },
];

export function Navbar() {
  const scrollY = useScrollPosition();
  const isScrolled = scrollY > 50;
  const pathname = usePathname();

  // Pages with light hero backgrounds need dark nav text even before scroll
  const lightPages = ['/blog', '/guides', '/faq', '/contact', '/about'];
  const isLightPage = lightPages.some(p => pathname === p || pathname.startsWith(p + '/'));
  const useDarkText = isLightPage || isScrolled;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Close dropdown on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };
    if (dropdownOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [dropdownOpen]);

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-surface/95 backdrop-blur-md shadow-sm'
            : 'bg-transparent'
        )}
        aria-label="Main navigation"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-16 flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="relative flex-shrink-0" aria-label="American Resources — Home">
            <Image
              src="/American-Resources_realLogo.webp"
              alt=""
              width={180}
              height={50}
              className="h-10 md:h-12 w-auto transition-opacity duration-300"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                ref={link.dropdown ? dropdownRef : undefined}
                onMouseEnter={() => link.dropdown && setDropdownOpen(true)}
                onMouseLeave={() => link.dropdown && setDropdownOpen(false)}
              >
                {link.dropdown ? (
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setDropdownOpen(!dropdownOpen);
                      }
                      if (e.key === 'ArrowDown' && !dropdownOpen) {
                        e.preventDefault();
                        setDropdownOpen(true);
                      }
                    }}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                    className={cn(
                      'font-sans text-[15px] font-medium transition-colors duration-200 flex items-center gap-1 cursor-pointer',
                      useDarkText
                        ? isActive(link.href) ? 'text-copper' : 'text-text-primary hover:text-copper'
                        : isActive(link.href) ? 'text-copper' : 'text-white hover:text-navy-pale'
                    )}
                  >
                    {link.label}
                    <svg className={cn('w-3 h-3 transition-transform duration-200', dropdownOpen && 'rotate-180')} fill="none" viewBox="0 0 10 6" aria-hidden="true">
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className={cn(
                      'font-sans text-[15px] font-medium transition-colors duration-200',
                      useDarkText
                        ? isActive(link.href) ? 'text-copper' : 'text-text-primary hover:text-copper'
                        : isActive(link.href) ? 'text-copper' : 'text-white hover:text-navy-pale'
                    )}
                  >
                    {link.label}
                  </Link>
                )}

                {/* Dropdown */}
                {link.dropdown && dropdownOpen && (
                  <div className="absolute top-full left-0 pt-2" role="menu">
                    <div className="bg-white rounded-xl shadow-xl border border-border py-3 px-2 min-w-[260px]">
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          role="menuitem"
                          className="block px-4 py-2.5 font-serif text-lg text-text-primary hover:bg-navy-pale rounded-lg transition-colors duration-150"
                          onClick={() => setDropdownOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Phone */}
            <a
              href={companyInfo.phoneHref}
              className={cn(
                'font-sans text-sm transition-colors duration-200',
                useDarkText ? 'text-text-muted hover:text-text-primary' : 'text-white/70 hover:text-white'
              )}
            >
              {companyInfo.phone}
            </a>

            {/* CTA */}
            <Link
              href="/contact"
              className="bg-accent text-white font-sans font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-accent-hover active:scale-[0.98] transition-all duration-200"
            >
              Get a Quote
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-3 -mr-3"
            aria-label="Open navigation menu"
          >
            <svg className={cn('w-6 h-6', useDarkText ? 'text-text-primary' : 'text-white')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={navLinks}
      />
    </>
  );
}
