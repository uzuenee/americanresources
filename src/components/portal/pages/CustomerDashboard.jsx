'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PortalPageHeader } from '../PortalShell';
import { Card, CardHeader } from '../Card';
import { StatusBadge } from '../StatusBadge';
import { MaterialLabel } from '../MaterialChip';
import { TruckIcon, FileTextIcon, ArrowRightIcon } from '../icons';
import { cn } from '@/utils/cn';

function WelcomeBanner({ onDismiss }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 pt-6 lg:px-8">
      <div className="relative rounded-sm border border-copper/40 bg-copper-light/40 px-5 py-4 pr-14 sm:pr-16">
        <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-copper">
          Welcome aboard
        </p>
        <p className="mt-2 font-sans text-[0.9375rem] font-semibold text-text-primary">
          Account confirmed — welcome to American Resources.
        </p>
        <p className="mt-1 font-sans text-[0.875rem] text-text-muted">
          Submit your first pickup request whenever you&apos;re ready. We
          usually confirm within one business day.
        </p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss welcome message"
          className="absolute right-2 top-2 inline-flex items-center rounded-sm px-2.5 py-1.5 font-sans text-[0.75rem] font-semibold text-text-muted transition-colors before:absolute before:inset-[-8px] before:content-[''] hover:bg-offwhite hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-light"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso + (iso.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function relativeTime(iso) {
  if (!iso) return '';
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} hr${diffH === 1 ? '' : 's'} ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD} day${diffD === 1 ? '' : 's'} ago`;
  const diffW = Math.floor(diffD / 7);
  if (diffW < 5) return `${diffW} wk${diffW === 1 ? '' : 's'} ago`;
  const diffMo = Math.floor(diffD / 30);
  return `${diffMo} mo ago`;
}

export function CustomerDashboard({ customer, lastEntry, nextRequest, activity, showWelcome = false }) {
  const router = useRouter();
  const [welcomeVisible, setWelcomeVisible] = useState(showWelcome);

  if (!customer) return null;

  const dismissWelcome = () => {
    setWelcomeVisible(false);
    router.replace('/portal/dashboard');
  };

  const sinceLabel = customer.since
    ? new Date(customer.since + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '';

  const windowLabel = nextRequest
    ? nextRequest.timeWindow === 'morning'
      ? '8 AM – 12 PM'
      : nextRequest.timeWindow === 'afternoon'
        ? '12 PM – 5 PM'
        : 'No preference'
    : '';

  return (
    <>
      <PortalPageHeader
        title="Your account"
        actions={
          <Link
            href="/portal/request"
            className="inline-flex items-center gap-2 rounded-sm border-b-2 border-copper bg-accent px-4 py-2.5 font-sans text-[0.8125rem] font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Request a pickup
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        }
      />
      {welcomeVisible && <WelcomeBanner onDismiss={dismissWelcome} />}
      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 lg:px-8">
        <section className="mb-10 grid grid-cols-1 gap-8 border-b border-border pb-10 lg:grid-cols-[2fr_3fr] lg:items-end lg:gap-12">
          <div>
            <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-text-muted">
              Weight diverted
            </p>
            <p className="mt-3 font-serif text-[clamp(3rem,6vw,4.5rem)] font-bold leading-[0.95] text-text-primary tabular-nums">
              {Number(customer.totalWeight || 0).toLocaleString()}
              <span className="ml-2 font-sans text-[1rem] font-normal text-text-muted">lbs</span>
            </p>
            <p className="mt-3 font-sans text-[0.8125rem] text-text-muted">
              Across {customer.totalPickups || 0} pulls
              {sinceLabel ? ` since ${sinceLabel}.` : '.'}
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-6 lg:border-l lg:border-border lg:pl-10">
            <div>
              <dt className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-text-muted">
                Last pull
              </dt>
              <dd
                className="mt-2 font-serif text-[1.375rem] font-semibold text-text-primary tabular-nums"
                title={lastEntry ? `${Number(lastEntry.weight).toLocaleString()} lbs, ${lastEntry.material}` : 'No pulls on file'}
              >
                {lastEntry ? formatDate(lastEntry.date) : '—'}
              </dd>
            </div>
            <Link
              href="/portal/account"
              className="group block"
              title="See which streams we handle for your account"
            >
              <dt className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-text-muted transition-colors group-hover:text-text-primary">
                Streams in service
              </dt>
              <dd className="mt-2 font-serif text-[1.375rem] font-semibold text-text-primary tabular-nums transition-colors group-hover:text-navy-light">
                {customer.materials?.length ?? 0}
              </dd>
            </Link>
            <Link
              href="/portal/request"
              className="group block"
              title="Open the pull request form"
            >
              <dt className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-text-muted transition-colors group-hover:text-text-primary">
                Open requests
              </dt>
              <dd
                className={cn(
                  'mt-2 font-serif text-[1.375rem] font-semibold tabular-nums transition-colors group-hover:text-navy-light',
                  (customer.openRequests ?? 0) > 0 ? 'text-accent' : 'text-text-primary'
                )}
              >
                {customer.openRequests ?? 0}
              </dd>
            </Link>
          </dl>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader
              title="Recent activity"
              action={
                <Link
                  href="/portal/history"
                  className="inline-flex items-center gap-1 font-sans text-[0.8125rem] font-medium text-navy-light hover:underline"
                >
                  View all <ArrowRightIcon className="h-3 w-3" />
                </Link>
              }
            />
            {!activity || activity.length === 0 ? (
              <p className="font-sans text-[0.875rem] text-text-muted">
                No loads yet — your first pull will land here.
              </p>
            ) : (
              <ul className="-mx-2 divide-y divide-border/60">
                {activity.map((item) => (
                  <li key={item.id} className="flex items-start gap-3 px-2 py-3">
                    <span className="mt-0.5 flex-shrink-0 text-text-muted">
                      {item.type === 'pickup_logged' ? (
                        <TruckIcon className="h-4 w-4" />
                      ) : (
                        <FileTextIcon className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-sans text-[0.875rem] text-text-primary">
                        {item.description}
                      </p>
                    </div>
                    <span className="flex-shrink-0 font-sans text-[0.75rem] text-text-muted">
                      {relativeTime(item.timestamp)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader title="Next on the board" />
            {nextRequest ? (
              <div>
                <div className="flex items-start justify-between gap-3">
                  <MaterialLabel material={nextRequest.material} />
                  <StatusBadge status={nextRequest.status} />
                </div>
                <dl className="mt-4 space-y-2 font-sans text-[0.8125rem]">
                  <div className="flex justify-between gap-2">
                    <dt className="text-text-muted">Date</dt>
                    <dd className="text-text-primary">{formatDate(nextRequest.preferredDate)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-text-muted">Window</dt>
                    <dd className="text-text-primary">{windowLabel}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-text-muted">Est. weight</dt>
                    <dd className="text-text-primary tabular-nums">
                      {Number(nextRequest.estimatedWeight || 0).toLocaleString()} lbs
                    </dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div>
                <p className="font-sans text-[0.875rem] text-text-primary">
                  Nothing on the board.
                </p>
                <p className="mt-1 font-sans text-[0.8125rem] text-text-muted">
                  Got a load ready? We&apos;ll come get it.
                </p>
                <Link
                  href="/portal/request"
                  className="mt-4 inline-flex items-center gap-1 font-sans text-[0.8125rem] font-semibold text-navy-light hover:underline"
                >
                  Request a pickup <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
