'use client';

import { useState, useCallback, useRef } from 'react';
import { cn } from '@/utils/cn';

function RailButton({ label, icon, onClick, active = false }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active || undefined}
      className={cn(
        'flex h-12 w-12 items-center justify-center rounded-full border bg-transparent text-text-muted transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper',
        active
          ? 'border-copper text-navy'
          : 'border-border hover:border-copper hover:bg-offwhite-alt hover:text-navy'
      )}
    >
      {icon}
    </button>
  );
}

export function ShareRail({ title, horizontal = false }) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const synthRef = useRef(null);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }, []);

  const shareX = useCallback(() => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    window.open(
      `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      '_blank',
      'width=550,height=420'
    );
  }, [title]);

  const shareLinkedIn = useCallback(() => {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      '_blank',
      'width=550,height=420'
    );
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const toggleListen = useCallback(() => {
    const synth = window.speechSynthesis;
    if (speaking) {
      if (synth.paused) {
        synth.resume();
      } else {
        synth.pause();
        setSpeaking(false);
      }
      return;
    }
    synth.cancel();
    const body = document.querySelector('.article-body');
    if (!body) return;
    const text = body.textContent || '';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    synthRef.current = utterance;
    synth.speak(utterance);
    setSpeaking(true);
  }, [speaking]);

  const buttons = (
    <>
      {/* Listen */}
      <RailButton
        label={speaking ? 'Stop listening' : 'Listen to article'}
        active={speaking}
        onClick={toggleListen}
        icon={
          speaking ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16" />
            </svg>
          )
        }
      />

      {/* Copy link */}
      <div className="relative">
        <RailButton
          label="Copy link"
          onClick={copyLink}
          icon={
            copied ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            )
          }
        />
        {copied && (
          <span
            className={cn(
              'absolute whitespace-nowrap rounded bg-navy-dark px-2.5 py-1 font-sans text-xs text-text-on-dark motion-safe:animate-[fadeInOut_1.6s_ease_forwards]',
              horizontal
                ? 'bottom-full left-1/2 mb-2 -translate-x-1/2'
                : 'left-full top-1/2 ml-2.5 -translate-y-1/2'
            )}
          >
            Link copied
          </span>
        )}
      </div>

      {/* Share on X */}
      <RailButton
        label="Share on X"
        onClick={shareX}
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        }
      />

      {/* Share on LinkedIn */}
      <RailButton
        label="Share on LinkedIn"
        onClick={shareLinkedIn}
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
          </svg>
        }
      />

      {/* Print */}
      <RailButton
        label="Print article"
        onClick={handlePrint}
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
        }
      />
    </>
  );

  if (horizontal) {
    return (
      <div className="flex items-center gap-3">
        {buttons}
        <span className="ml-2 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-text-muted">
          Share
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {buttons}
      <div className="mt-3 h-px w-8 bg-border" aria-hidden="true" />
      <p
        className="mt-2 font-sans text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-text-muted"
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        aria-hidden="true"
      >
        Share This Piece
      </p>
    </div>
  );
}
