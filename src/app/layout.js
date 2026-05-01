import { Barlow_Condensed, Inter, Playfair_Display, Source_Serif_4 } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import { MotionProvider } from '@/components/MotionProvider';
import { RouteTransitionProvider } from '@/components/RouteTransition';
import { WebVitals } from '@/components/WebVitals';
import './globals.css';

const barlowCondensed = Barlow_Condensed({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const sourceSerif4 = Source_Serif_4({
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-reading',
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://recyclinggroup.com';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'American Resources',
  description:
    "Atlanta's trusted recycling partner. Environmental consulting, paper shredding, scrap metal, electronics, appliance & auto recycling for businesses.",
  url: SITE_URL,
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
      className={`${barlowCondensed.variable} ${inter.variable} ${playfairDisplay.variable} ${sourceSerif4.variable} antialiased`}
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
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && <WebVitals />}
        <MotionProvider>
          <RouteTransitionProvider>{children}</RouteTransitionProvider>
        </MotionProvider>
      </body>
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
    </html>
  );
}
