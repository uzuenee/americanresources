import Link from 'next/link';

export function ArticleCTA() {
  return (
    <section className="bg-navy px-8 py-16 text-center md:px-12">
      <h2 className="font-[family-name:var(--font-display)] text-[1.5rem] font-semibold text-white">
        Ready to streamline your recycling?
      </h2>
      <p className="mx-auto mt-3 max-w-md font-sans text-[1rem] leading-relaxed text-white/75">
        Get a free waste audit and find out how much you could save.
      </p>
      <Link
        href="/contact"
        className="mt-6 inline-block rounded-sm bg-accent px-8 py-3.5 font-sans text-[0.9375rem] font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Request your free audit
      </Link>
    </section>
  );
}
