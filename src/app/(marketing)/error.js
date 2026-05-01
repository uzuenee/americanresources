'use client';

import Link from 'next/link';

export default function MarketingError({ error, reset }) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-offwhite px-6 pt-20">
      <div className="max-w-md text-center">
        <p className="text-sm uppercase tracking-wide text-text-muted">Something went wrong</p>
        <h1 className="mt-2 font-serif text-3xl text-text-primary md:text-4xl">
          We hit an unexpected error
        </h1>
        <p className="mt-4 font-sans text-text-muted">
          Please try again. If the problem persists, contact us at{' '}
          <a href="tel:+17709348248" className="text-navy-light underline">(770) 934-8248</a>.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-text-primary/20 px-4 py-2 text-sm font-medium text-text-primary hover:bg-text-primary/5"
          >
            Return home
          </Link>
        </div>
      </div>
    </section>
  );
}
