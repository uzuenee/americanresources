import Link from 'next/link';

export const metadata = {
  title: '404 - Page Not Found',
};

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-offwhite pt-20">
      <div className="text-center px-6">
        <span className="font-serif text-8xl md:text-9xl text-navy-pale">404</span>
        <h1 className="font-serif text-3xl md:text-4xl text-text-primary mt-4 mb-4">
          Page Not Found
        </h1>
        <p className="font-sans text-lg text-text-muted mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-accent text-white font-sans font-semibold text-base px-8 py-3.5 rounded-lg hover:bg-accent-hover transition-all duration-200"
        >
          &larr; Back to Home
        </Link>
      </div>
    </section>
  );
}
