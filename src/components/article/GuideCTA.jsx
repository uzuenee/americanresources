import { Button } from '@/components/ui/Button';

/**
 * GuideCTA — lightweight inline call-to-action for guide articles.
 * Simple centered section with thin top border. No shimmer, no navy box.
 *
 * @param {{ topic?: string }} props
 */
export function GuideCTA({ topic }) {
  return (
    <section className="bg-offwhite">
      <div className="mx-auto max-w-[680px] border-t border-border px-6 py-12 text-center md:px-8">
        <p className="font-serif text-[1.25rem] leading-snug text-text-primary">
          {topic
            ? `Need help with ${topic}?`
            : "Have questions? We're here to help."}
        </p>
        <div className="mt-6">
          <Button href="/contact" variant="secondary-dark">
            Get in touch
          </Button>
        </div>
      </div>
    </section>
  );
}
