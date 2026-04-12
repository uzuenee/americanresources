'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import { usePortalAuth } from './PortalAuthContext';
import {
  BellIcon,
  ChevronDownIcon,
  LogOutIcon,
  TruckIcon,
  FileTextIcon,
  CheckCircleIcon,
} from './icons';
import { SidebarToggleButton } from './PortalSidebar';

function getPersonInitials(name) {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function relativeTime(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

function FeedIcon({ type }) {
  if (type === 'pickup_logged') return <TruckIcon className="h-3.5 w-3.5" />;
  if (type === 'request_scheduled') return <CheckCircleIcon className="h-3.5 w-3.5" />;
  return <FileTextIcon className="h-3.5 w-3.5" />;
}

export function PortalHeader({ title, subtitle, actions, breadcrumbs, onMenuClick }) {
  const { user, recentActivity, signOut } = usePortalAuth();
  const [userOpen, setUserOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const userMenuRef = useRef(null);
  const bellMenuRef = useRef(null);

  const items = recentActivity ?? [];

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserOpen(false);
      if (bellMenuRef.current && !bellMenuRef.current.contains(e.target)) setBellOpen(false);
    };
    if (userOpen || bellOpen) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [userOpen, bellOpen]);

  const handleSignOut = () => {
    signOut();
  };

  const destFor = (item) => {
    if (user?.role === 'admin') {
      return `/admin/customers/${item.customerId}`;
    }
    return item.type === 'pickup_logged' ? '/portal/history' : '/portal/dashboard';
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-surface/95 backdrop-blur-sm">
      <div className="flex flex-col gap-5 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-10 lg:py-8">
        <div className="flex items-start gap-4 lg:items-center">
          <SidebarToggleButton onClick={onMenuClick} />
          <div className="min-w-0">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav aria-label="Breadcrumb" className="mb-2.5">
                <ol className="flex items-center gap-1.5 font-sans text-[0.75rem] text-text-muted">
                  {breadcrumbs.map((b, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      {idx > 0 && <span aria-hidden="true">/</span>}
                      {b.href ? (
                        <Link href={b.href} className="transition-colors hover:text-text-primary">
                          {b.label}
                        </Link>
                      ) : (
                        <span>{b.label}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            <h1 className="font-serif text-[1.5rem] font-semibold leading-[1.15] text-text-primary lg:text-[1.75rem]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 font-sans text-[0.8125rem] text-text-muted">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {actions}
          <div ref={bellMenuRef} className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => {
                setBellOpen((v) => !v);
                setUserOpen(false);
              }}
              className="relative flex items-center justify-center rounded-sm p-2 text-text-muted transition-colors hover:bg-offwhite-alt hover:text-text-primary"
              aria-label={`Notifications${items.length ? ` (${items.length})` : ''}`}
              aria-haspopup="true"
              aria-expanded={bellOpen}
            >
              <BellIcon className="h-5 w-5" />
              {items.length > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-copper"
                />
              )}
            </button>
            {bellOpen && (
              <div className="absolute right-0 top-full mt-2 w-[22rem] rounded-sm border border-border bg-surface py-2 shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-between px-4 pb-2 pt-1">
                  <p className="font-serif text-[0.875rem] font-semibold text-text-primary">
                    Recent activity
                  </p>
                  <span className="font-sans text-[0.6875rem] uppercase tracking-wide text-text-muted">
                    last {Math.min(items.length, 5)}
                  </span>
                </div>
                <div className="h-px bg-border" />
                {items.length === 0 ? (
                  <p className="px-4 py-6 text-center font-sans text-[0.8125rem] text-text-muted">
                    Nothing yet.
                  </p>
                ) : (
                  <ul className="max-h-80 overflow-y-auto">
                    {items.map((item) => {
                      const showCompany =
                        user?.role === 'admin' && item.customerCompany;
                      return (
                        <li key={item.id}>
                          <Link
                            href={destFor(item)}
                            onClick={() => setBellOpen(false)}
                            className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-offwhite-alt"
                          >
                            <span className="mt-1 flex-shrink-0 text-text-muted">
                              <FeedIcon type={item.type} />
                            </span>
                            <div className="min-w-0 flex-1">
                              {showCompany && (
                                <p className="truncate font-sans text-[0.75rem] font-semibold text-navy-light">
                                  {item.customerCompany}
                                </p>
                              )}
                              <p className="font-sans text-[0.8125rem] text-text-primary">
                                {item.description}
                              </p>
                              <p className="mt-0.5 font-sans text-[0.6875rem] text-text-muted">
                                {relativeTime(item.timestamp)}
                              </p>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
          {user && (
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setUserOpen((v) => !v);
                  setBellOpen(false);
                }}
                className="flex items-center gap-2 rounded-sm px-1 py-1 transition-colors hover:bg-offwhite-alt"
                aria-haspopup="true"
                aria-expanded={userOpen}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-copper font-sans text-[0.6875rem] font-semibold text-white">
                  {getPersonInitials(user.name)}
                </div>
                <ChevronDownIcon className={cn('h-3 w-3 text-text-muted transition-transform', userOpen && 'rotate-180')} />
              </button>
              {userOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-sm border border-border bg-surface py-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                  <div className="px-4 pb-2">
                    <p className="font-serif text-[0.875rem] font-semibold text-text-primary">
                      {user.name}
                    </p>
                    <p className="truncate font-sans text-[0.75rem] text-text-muted">
                      {user.email}
                    </p>
                  </div>
                  <div className="my-1 h-px bg-border" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-4 py-2 font-sans text-[0.8125rem] text-text-primary transition-colors hover:bg-offwhite-alt"
                  >
                    <LogOutIcon className="h-4 w-4 text-text-muted" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
