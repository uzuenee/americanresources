'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { m, AnimatePresence } from 'framer-motion';
import { PortalPageHeader } from '../PortalShell';
import { StatusBadge } from '../StatusBadge';
import { MaterialDotRow } from '../MaterialChip';
import { materialMeta } from '@/lib/materials';
import { SearchIcon, MapPinIcon, ArrowRightIcon } from '../icons';
import { cn } from '@/utils/cn';

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'active', label: 'Active' },
  { id: 'pilot', label: 'Pilot' },
];

// customers shape: { id, company, status, location, materials, totalWeight,
//   openRequests, contact: { name, title } }
export function AdminCustomerList({ customers }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const pendingCount = useMemo(
    () => (customers ?? []).filter((c) => c.status === 'pending').length,
    [customers]
  );

  const filtered = useMemo(() => {
    let list = customers ?? [];
    if (statusFilter !== 'all') {
      list = list.filter((c) => c.status === statusFilter);
    }
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => {
      return (
        c.company.toLowerCase().includes(q) ||
        (c.contact?.name || '').toLowerCase().includes(q) ||
        (c.location || '').toLowerCase().includes(q) ||
        (c.materials || []).some((m) => (materialMeta[m]?.label || '').toLowerCase().includes(q))
      );
    });
  }, [customers, query, statusFilter]);

  return (
    <>
      <PortalPageHeader
        title="Accounts"
        actions={
          <div className="flex items-center gap-3">
            <label className="relative">
              <span className="sr-only">Search accounts</span>
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="search"
                placeholder="Search all accounts…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (e.target.value.trim()) setStatusFilter('all');
                }}
                className="w-full rounded-sm border border-border bg-surface py-2 pl-9 pr-3 font-sans text-[0.8125rem] text-text-primary placeholder:text-text-muted/70 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15 sm:w-80"
              />
            </label>
          </div>
        }
      />
      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 lg:px-8">
        <div className="mb-5 flex gap-1.5">
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.id;
            const count = f.id === 'pending' ? pendingCount : null;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-sans text-[0.8125rem] font-medium transition-colors',
                  active
                    ? 'bg-navy text-white'
                    : 'bg-offwhite-alt text-text-muted hover:bg-border hover:text-text-primary'
                )}
              >
                {f.label}
                {count > 0 && (
                  <span
                    className={cn(
                      'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.6875rem] font-bold',
                      active ? 'bg-white/20 text-white' : 'bg-[#FEF3C7] text-[#92400E]'
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-sm border border-border/70 bg-surface p-12 text-center">
            <p className="font-serif text-[1.25rem] font-semibold text-text-primary">
              {query ? 'No accounts match' : 'No accounts yet'}
            </p>
            <p className="mt-1 font-sans text-[0.875rem] text-text-muted">
              {query ? 'Try a different search or clear the filter.' : 'Accounts will appear here once customers sign up.'}
            </p>
          </div>
        ) : (
          <m.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {filtered.map((customer) => (
                <m.div
                  key={customer.id}
                  layout
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="group block h-full rounded-sm border border-border/70 bg-surface p-6 transition-colors duration-200 hover:border-navy/50 hover:bg-offwhite-alt/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-serif text-[1.125rem] font-semibold leading-snug text-navy group-hover:text-navy-light">
                        {customer.company}
                      </h3>
                      <StatusBadge status={customer.status} />
                    </div>
                    {customer.contact?.name && (
                      <p className="mt-2 font-sans text-[0.8125rem] text-text-muted">
                        {customer.contact.name}{customer.contact.title ? ` · ${customer.contact.title}` : ''}
                      </p>
                    )}
                    {customer.location && (
                      <p className="mt-1 flex items-start gap-1.5 font-sans text-[0.8125rem] text-text-muted">
                        <MapPinIcon className="mt-0.5 h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{customer.location}</span>
                      </p>
                    )}
                    <div className="mt-4 flex items-end justify-between border-t border-border/60 pt-4">
                      <div className="flex gap-5">
                        <div>
                          <p className="font-sans text-[0.875rem] font-semibold text-text-primary tabular-nums">
                            {Number(customer.totalWeight || 0).toLocaleString()} lbs
                          </p>
                          <p className="font-sans text-[0.6875rem] uppercase tracking-wide text-text-muted">diverted</p>
                        </div>
                        <div>
                          <p className={'font-sans text-[0.875rem] font-semibold tabular-nums ' + ((customer.openRequests ?? 0) > 0 ? 'text-accent' : 'text-text-primary')}>
                            {customer.openRequests ?? 0} open
                          </p>
                          <p className="font-sans text-[0.6875rem] uppercase tracking-wide text-text-muted">dispatches</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {customer.materials?.length > 0 && <MaterialDotRow materials={customer.materials} />}
                        <ArrowRightIcon className="h-4 w-4 text-text-muted opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                      </div>
                    </div>
                  </Link>
                </m.div>
              ))}
            </AnimatePresence>
          </m.div>
        )}
      </div>
    </>
  );
}
