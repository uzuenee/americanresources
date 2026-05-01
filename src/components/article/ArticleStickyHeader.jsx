'use client';

import { useState, useEffect, useCallback } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { ArrowLeftIcon } from '@/components/portal/icons';
import { useRouter } from 'next/navigation';

export function ArticleStickyHeader({ title, readingTime = 10 }) {
  const scrollY = useScrollPosition();
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      router.push('/blog');
    }
  }, [router]);
  const [heroHeight, setHeroHeight] = useState(0);
  const [articleHeight, setArticleHeight] = useState(0);
  const [articleTop, setArticleTop] = useState(0);

  useEffect(() => {
    function measure() {
      const hero = document.querySelector('.article-hero');
      const body = document.querySelector('.article-reading-rig');
      if (hero) setHeroHeight(hero.offsetHeight);
      if (body) {
        setArticleHeight(body.offsetHeight);
        setArticleTop(body.offsetTop);
      }
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight : 800
  );
  useEffect(() => {
    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const show = heroHeight > 0 && scrollY > heroHeight - 80;
  const scrollable = articleHeight - viewportHeight;
  const scrolledIntoArticle = scrollY - articleTop;
  const rawPercent = scrollable > 0 ? (scrolledIntoArticle / scrollable) * 100 : 0;
  const percent = Math.max(0, Math.min(100, rawPercent));

  const readTime = Math.max(0, Math.ceil(((100 - percent) / 100) * readingTime));
  const displayTitle = title.length > 50 ? title.slice(0, 50) + '\u2026' : title;

  return (
    <AnimatePresence>
      {show && (
        <m.div
          initial={prefersReducedMotion ? { opacity: 1 } : { y: -56 }}
          animate={{ y: 0, opacity: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { y: -56 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed left-0 right-0 z-40 top-0"
          role="navigation"
          aria-label="Article navigation"
        >
          <div className="flex h-14 items-center justify-between border-b border-border/50 bg-surface/95 px-6 backdrop-blur-md lg:px-10">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={handleBack}
                className="flex-shrink-0 rounded-sm p-1.5 text-text-muted transition-colors hover:text-text-primary"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </button>
              <p className="truncate font-sans text-[0.875rem] font-medium text-text-primary">
                {displayTitle}
              </p>
            </div>
            <span className="flex-shrink-0 font-sans text-[0.8125rem] text-text-muted">
              {readTime > 0 ? `${readTime} min left` : 'Done'}
            </span>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
