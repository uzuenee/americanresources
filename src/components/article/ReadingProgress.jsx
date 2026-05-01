'use client';

import { useState, useEffect, useRef } from 'react';

export function ReadingProgress() {
  const [percent, setPercent] = useState(0);
  const lastPercent = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    function update() {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const body = document.querySelector('.article-reading-rig');
        if (body) {
          const top = body.offsetTop;
          const height = body.offsetHeight;
          const scrolled = window.scrollY - top;
          const viewportH = window.innerHeight;
          const scrollable = height - viewportH;
          const raw = scrollable > 0 ? (scrolled / scrollable) * 100 : 0;
          const clamped = Math.max(0, Math.min(100, Math.round(raw)));
          if (clamped !== lastPercent.current) {
            lastPercent.current = clamped;
            setPercent(clamped);
          }
        }
        ticking.current = false;
      });
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div className="reading-progress" aria-hidden="true">
      <div className="reading-progress-bar" style={{ width: `${percent}%` }} />
    </div>
  );
}
