'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouteTransition } from '@/components/RouteTransition';
import { ArrowLeftIcon } from './icons';
import { AuthPageTransition } from './AuthPageTransition';

function isModifiedEvent(e) {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
}

export function AuthShell({ children }) {
  const { transitionTo } = useRouteTransition();

  const handleBackHome = (e) => {
    if (isModifiedEvent(e)) return;
    e.preventDefault();
    transitionTo('/', 'back');
  };

  return (
    <div className="flex min-h-dvh bg-offwhite">
      <aside className="relative hidden w-[45%] bg-navy-dark lg:block xl:w-[50%]">
        <Image
          src="/portal/Scrap_metal_yard_202604112018.jpeg"
          alt=""
          fill
          priority
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/2wBDACgcHiMeGSgjISMtKygwPGRBPDc3PHtYXUlkkYCZlo+AjIqgtObDoKrarYqMyP/L2u71////m8H////6/+b9//j/2wBDASstLTw1PHZBQXb4pYyl+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj/wAARCAAJABADASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAA/9k="
          sizes="(min-width: 1280px) 50vw, 45vw"
          className="object-cover opacity-80 transition-opacity duration-700"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/60 to-navy-dark/25"
        />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <Link href="/" aria-label="American Resources home" className="inline-flex" onClick={handleBackHome}>
            <Image
              src="/American-Resources_realLogo.webp"
              alt="American Resources"
              width={180}
              height={50}
              className="h-11 w-auto brightness-0 invert"
              priority
            />
          </Link>
          <div className="text-white">
            <h2 className="font-serif text-[clamp(2.5rem,4vw,3.75rem)] font-bold leading-[0.95]">
              Twenty years
              <br />
              hauling Atlanta.
            </h2>
            <p className="mt-5 max-w-sm font-sans text-[0.9375rem] leading-relaxed text-white/85">
              Family-run recycler. Metal, paper, plastic, pallets, electronics —
              anything your facility needs gone.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-5 lg:hidden">
          <Link href="/" aria-label="American Resources home" className="inline-flex" onClick={handleBackHome}>
            <Image
              src="/American-Resources_realLogo.webp"
              alt="American Resources"
              width={140}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <Link
            href="/"
            onClick={handleBackHome}
            className="inline-flex items-center gap-1.5 font-sans text-[0.8125rem] text-text-muted transition-colors hover:text-text-primary"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Back
          </Link>
        </div>

        <div className="hidden items-center justify-end px-10 py-6 lg:flex xl:px-16">
          <Link
            href="/"
            onClick={handleBackHome}
            className="inline-flex items-center gap-1.5 font-sans text-[0.8125rem] text-text-muted transition-colors hover:text-text-primary"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Back to site
          </Link>
        </div>

        <div className="flex flex-1 items-start justify-start px-6 py-10 sm:px-10 lg:items-center lg:px-16 xl:px-24">
          <div className="w-full max-w-[28rem]">
            <AuthPageTransition>{children}</AuthPageTransition>
          </div>
        </div>
      </main>
    </div>
  );
}
