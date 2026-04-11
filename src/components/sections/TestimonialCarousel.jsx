import { testimonials } from '@/data/testimonials';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';

export function Testimonials() {
  return (
    <section className="bg-offwhite-alt py-12 md:py-16 lg:py-20 border-t border-border/60">
      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        <h2 className="sr-only">What Our Partners Say</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {testimonials.map((testimonial, i) => (
            <AnimateOnScroll key={i} delay={i * 0.1}>
              <blockquote className="relative">
                <span
                  className="font-serif text-5xl text-copper/60 leading-none select-none block mb-1"
                  aria-hidden="true"
                >
                  &ldquo;
                </span>
                <p className="font-serif italic text-lg text-text-primary leading-[1.5] mb-6">
                  {testimonial.quote}
                </p>
                <footer className="flex items-center gap-3">
                  <div className="w-6 h-0.5 bg-copper" aria-hidden="true" />
                  <div>
                    <span className="font-sans font-semibold text-sm text-text-primary block">
                      {testimonial.name}
                    </span>
                    <span className="font-sans text-sm text-text-muted">
                      {testimonial.title}, {testimonial.company}
                    </span>
                  </div>
                </footer>
              </blockquote>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
