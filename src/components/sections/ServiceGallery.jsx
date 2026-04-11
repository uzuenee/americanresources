'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { services } from '@/data/services';
import { cn } from '@/utils/cn';

/* ─── Alt text for gallery images ─── */
const galleryAlt = [
  'Consultant reviewing waste management documentation at an industrial facility',
  'Locked shredding bin for secure confidential document destruction',
  'Sorted copper wire and sheet metal ready for processing',
  'Circuit boards and electronic components staged for recycling',
  'Commercial appliances queued for disassembly and material recovery',
  'Vehicle chassis and auto parts in the recycling yard',
];

/* ─── Mechanical easing — intentional, industrial, no bounce ─── */
const mechanicalEase = [0.33, 0, 0.2, 1];

export function ServiceGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef(null);

  const go = useCallback((dir) => {
    setDirection(dir);
    setActiveIndex((prev) => {
      const next = prev + dir;
      if (next < 0) return services.length - 1;
      if (next >= services.length) return 0;
      return next;
    });
  }, []);

  const selectService = useCallback((i) => {
    setDirection(i > activeIndex ? 1 : -1);
    setActiveIndex(i);
  }, [activeIndex]);

  /* ─── Keyboard navigation ─── */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      go(-1);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      go(1);
    }
  }, [go]);

  const active = services[activeIndex];

  return (
    <section
      ref={sectionRef}
      className="relative lg:h-[min(100vh,56.25vw)] overflow-hidden flex items-center"
      aria-label="Our services"
    >
      {/* ── Fullscreen background images ── */}
      {services.map((service, i) => (
        <m.div
          key={service.slug}
          className="absolute inset-0"
          initial={false}
          animate={{
            opacity: activeIndex === i ? 1 : 0,
            scale: activeIndex === i ? 1 : 1.02,
          }}
          transition={
            reducedMotion
              ? { duration: 0.3 }
              : {
                  opacity: { duration: 0.6, ease: mechanicalEase },
                  scale: { duration: 0.8, ease: mechanicalEase },
                }
          }
        >
          <Image
            src={service.galleryImage}
            alt={galleryAlt[i] || service.shortTitle}
            fill
            className="object-cover"
            sizes="100vw"
            priority={i === 0}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        </m.div>
      ))}

      {/* ── Dark overlay — heavier left for text, image breathes right ── */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/90 via-navy-dark/70 to-navy-dark/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/70 via-transparent to-navy-dark/40" />

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto max-w-[87.5rem] px-6 lg:px-16 w-full py-28 lg:py-36">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* ── Left: Heading + Service list (always visible) ── */}
          <div className="lg:col-span-5 xl:col-span-5">
            {/* Eyebrow */}
            <m.div
              initial={reducedMotion ? false : { opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: mechanicalEase }}
              className="flex items-center gap-3 mb-5"
            >
              <span className="block w-8 h-px bg-copper" aria-hidden="true" />
              <span className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-copper">
                What We Do
              </span>
            </m.div>

            {/* Heading */}
            <m.h2
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08, ease: mechanicalEase }}
              className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] text-white leading-[1.08] mb-10"
            >
              Six Solutions, One Partner
            </m.h2>

            {/* Service tabs — all 6 visible, keyboard navigable */}
            <div
              role="tablist"
              aria-label="Services"
              onKeyDown={handleKeyDown}
            >
              {services.map((service, i) => (
                <m.div
                  key={service.slug}
                  initial={reducedMotion ? false : { opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.12 + i * 0.04, ease: mechanicalEase }}
                >
                  <button
                    role="tab"
                    id={`service-tab-${i}`}
                    aria-selected={activeIndex === i}
                    aria-controls="service-panel"
                    tabIndex={activeIndex === i ? 0 : -1}
                    onClick={() => selectService(i)}
                    onFocus={() => selectService(i)}
                    className={cn(
                      'w-full flex items-center justify-between py-3.5 md:py-4 border-b text-left transition-all duration-300 group min-h-[3rem]',
                      activeIndex === i
                        ? 'border-copper/50 opacity-100'
                        : 'border-white/8 opacity-40 hover:opacity-70'
                    )}
                  >
                    <div className="flex items-baseline gap-3.5">
                      <span
                        className={cn(
                          'font-mono text-[0.6875rem] tabular-nums transition-colors duration-300',
                          activeIndex === i ? 'text-copper' : 'text-white/20'
                        )}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={cn(
                          'font-serif text-base md:text-lg lg:text-xl text-white transition-colors duration-300',
                          activeIndex === i && 'text-copper-light'
                        )}
                      >
                        {service.shortTitle}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'text-sm transition-all duration-300 flex-shrink-0 ml-3',
                        activeIndex === i
                          ? 'translate-x-0.5 text-copper'
                          : 'translate-x-0 text-white/15 group-hover:text-white/30'
                      )}
                      aria-hidden="true"
                    >
                      &rarr;
                    </span>
                  </button>
                </m.div>
              ))}
            </div>

            {/* Active tagline */}
            <div
              id="service-panel"
              role="tabpanel"
              aria-labelledby={`service-tab-${activeIndex}`}
              className="mt-6 min-h-[3rem]"
            >
              <AnimatePresence mode="wait">
                <m.p
                  key={activeIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: mechanicalEase }}
                  className="font-sans text-sm text-white/70 leading-relaxed max-w-sm"
                >
                  {active.tagline}
                </m.p>
              </AnimatePresence>
            </div>
          </div>

          {/* ── Right: Service detail link ── */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col items-center lg:items-end justify-end">
            <AnimatePresence mode="wait">
              <m.div
                key={activeIndex}
                initial={{ opacity: 0, x: direction * 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -24 }}
                transition={{ duration: 0.3, ease: mechanicalEase }}
              >
                <Link
                  href={`/services/${active.slug}`}
                  className="group inline-flex items-center gap-3 font-sans text-sm font-medium text-white bg-white/10 hover:bg-white/15 backdrop-blur-sm px-5 py-2.5 rounded-full transition-all duration-300"
                >
                  Learn about {active.shortTitle}
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 text-copper" aria-hidden="true">&rarr;</span>
                </Link>
              </m.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
