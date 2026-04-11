import { Instrument_Serif, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MotionProvider } from '@/components/MotionProvider';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'American Resources | Atlanta Recycling & Waste Management',
    template: '%s | American Resources',
  },
  description:
    'Atlanta\'s trusted recycling partner. Environmental consulting, paper shredding, scrap metal, electronics, appliance & auto recycling for businesses. 20+ years of experience.',
  keywords: [
    'recycling Atlanta',
    'scrap metal recycling',
    'commercial recycling',
    'e-waste disposal',
    'paper shredding Atlanta',
    'environmental consulting',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'American Resources',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'American Resources',
  description:
    "Atlanta's trusted recycling partner. Environmental consulting, paper shredding, scrap metal, electronics, appliance & auto recycling for businesses.",
  url: 'https://americanresources.com',
  telephone: '+1-770-934-8248',
  email: 'info@recyclinggroup.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Atlanta',
    addressRegion: 'GA',
    postalCode: '30301',
    addressCountry: 'US',
  },
  openingHours: 'Mo-Fr 08:00-17:00',
  foundingDate: '2005',
  areaServed: {
    '@type': 'GeoCircle',
    geoMidpoint: { '@type': 'GeoCoordinates', latitude: 33.749, longitude: -84.388 },
    geoRadius: '80000',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-offwhite text-text-primary font-sans">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <MotionProvider>
          <Navbar />
          <main id="main-content">{children}</main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
