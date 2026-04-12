'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { PortalPageHeader } from '../PortalShell';
import { DataTable } from '../DataTable';
import { StatusBadge } from '../StatusBadge';
import { MaterialLabel } from '../MaterialChip';
import { FormField, Select } from '../FormField';
import { useToast } from '../Toast';
import { materialMeta } from '@/lib/materials';
import { schedulePickupAction, markLoadedAction, deletePickupAction } from '@/app/actions/dispatch';
import {
  SearchIcon,
  RefreshIcon,
  MoreVerticalIcon,
  TrashIcon,
  XIcon,
} from '../icons';
import { cn } from '@/utils/cn';

const WINDOW_HOURS = {
  morning: 'Morning · 8am–12pm',
  afternoon: 'Afternoon · 12pm–5pm',
};

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function windowLabel(w) {
  if (w === 'morning') return 'Morning';
  if (w === 'afternoon') return 'Afternoon';
  return '';
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function daysBetween(iso) {
  if (!iso) return null;
  const then = new Date(iso + 'T00:00:00').getTime();
  return Math.round((then - startOfToday()) / 86400000);
}

function relativeTime(iso) {
  if (!iso) return '—';
  const then = new Date(iso).getTime();
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  const diffH = Math.floor(diffSec / 3600);
  if (diffH < 1) return 'moments ago';
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

function urgencyTier(row) {
  if (row.effectiveStatus === 'scheduled') {
    const d = daysBetween(row.scheduledDate);
    if (d == null) return 7;
    if (d <= -2) return 1;
    if (d <= 0) return 3;
    if (d <= 3) return 5;
    return 7;
  }
  if (row.effectiveStatus === 'under_review') {
    const d = daysBetween(row.preferredDate);
    if (d == null) return 6;
    if (d <= 0) return 2;
    if (d <= 2) return 4;
    return 6;
  }
  return 7;
}

function tierColor(tier) {
  if (tier === 1) return 'super-red';
  if (tier === 2 || tier === 3) return 'red';
  if (tier === 4 || tier === 5) return 'yellow';
  return null;
}

const PILL_CLASSES = {
  'super-red': 'bg-[#7F1D1D] text-white font-semibold shadow-[0_0_0_1px_rgba(127,29,29,0.2)]',
  red: 'bg-accent-light text-accent font-semibold',
  yellow: 'bg-[#FAE8C8] text-copper-dark font-semibold',
};

function UrgencyPill({ urgency, title, children }) {
  if (!urgency) {
    return (
      <span
        title={title}
        className="inline-flex items-center font-sans text-[0.8125rem] tabular-nums text-text-primary"
      >
        {children}
      </span>
    );
  }
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-1 font-sans text-[0.8125rem] tabular-nums',
        PILL_CLASSES[urgency]
      )}
    >
      {children}
    </span>
  );
}

// requests shape: { id, customerId, customerCompany, material, estimatedWeight,
//   preferredDate, timeWindow, scheduledDate, scheduledWindow, status }
// stats shape: { openDispatches, activeAccounts, ytdWeight, lastLoadAt }
export function AdminDashboard({ requests: initialRequests, stats }) {
  const { toast } = useToast();
  const [, startTransition] = useTransition();

  // Local state is the source of truth for the current session — optimistic
  // updates apply immediately. Full re-fetch happens on next navigation.
  const [requests, setRequests] = useState(initialRequests ?? []);
  const [statusFilter, setStatusFilter] = useState('open');
  const [streamFilter, setStreamFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(null);
  const [openKebab, setOpenKebab] = useState(null); // { id, x, y }
  const [modal, setModal] = useState(null);

  useEffect(() => {
    if (!openKebab) return;
    const onDocClick = () => setOpenKebab(null);
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [openKebab]);

  const rows = useMemo(() => {
    const enriched = requests.map((r) => ({ ...r, effectiveStatus: r.status, _tier: urgencyTier({ ...r, effectiveStatus: r.status }) }));

    const filtered = enriched
      .filter((r) => {
        if (statusFilter === 'open') return r.effectiveStatus !== 'completed' && r.effectiveStatus !== 'cancelled';
        if (statusFilter === 'all') return true;
        return r.effectiveStatus === statusFilter;
      })
      .filter((r) => streamFilter === 'all' || r.material === streamFilter)
      .filter((r) => {
        if (!query.trim()) return true;
        return (r.customerCompany || '').toLowerCase().includes(query.toLowerCase());
      });

    if (sort) return filtered;
    return filtered.sort((a, b) => {
      if (a._tier !== b._tier) return a._tier - b._tier;
      const aDate = a.effectiveStatus === 'scheduled' ? a.scheduledDate : a.preferredDate;
      const bDate = b.effectiveStatus === 'scheduled' ? b.scheduledDate : b.preferredDate;
      return String(aDate || '').localeCompare(String(bDate || ''));
    });
  }, [requests, statusFilter, streamFilter, query, sort]);

  const openCount = useMemo(
    () => requests.filter((r) => r.status !== 'completed' && r.status !== 'cancelled').length,
    [requests]
  );

  const notify = (row, title) => {
    toast({ title, description: row.customerCompany || '' });
  };

  const markLoaded = (row) => {
    setRequests((prev) => prev.map((r) => r.id === row.id ? { ...r, status: 'completed' } : r));
    notify(row, 'Marked as loaded');
    startTransition(async () => {
      const result = await markLoadedAction(row.id);
      if (result?.error) {
        // Revert optimistic update
        setRequests((prev) => prev.map((r) => r.id === row.id ? { ...r, status: row.status } : r));
        toast({ title: 'Error', description: result.error });
      }
    });
  };

  const applySchedule = (row, date, window) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === row.id
          ? { ...r, status: 'scheduled', scheduledDate: date, scheduledWindow: window }
          : r
      )
    );
    notify(row, row.status === 'scheduled' ? 'Pickup rescheduled' : 'Pickup scheduled');
    setModal(null);
    startTransition(async () => {
      const result = await schedulePickupAction(row.id, date, window);
      if (result?.error) {
        setRequests((prev) => prev.map((r) => r.id === row.id ? { ...r, status: row.status, scheduledDate: row.scheduledDate, scheduledWindow: row.scheduledWindow } : r));
        toast({ title: 'Error', description: result.error });
      }
    });
  };

  const deleteRequest = (row) => {
    setRequests((prev) => prev.filter((r) => r.id !== row.id));
    notify(row, 'Request deleted');
    setModal(null);
    startTransition(async () => {
      const result = await deletePickupAction(row.id);
      if (result?.error) {
        setRequests((prev) => [...prev, row].sort(() => 0));
        toast({ title: 'Error', description: result.error });
      }
    });
  };

  const openSchedule = (row) => {
    setModal({ mode: row.status === 'scheduled' ? 'reschedule' : 'schedule', row });
  };

  const columns = [
    {
      key: 'customerCompany',
      header: 'Account',
      sortable: true,
      render: (row) =>
        row.customerId ? (
          <Link href={`/admin/customers/${row.customerId}`} className="font-semibold text-navy-light hover:underline">
            {row.customerCompany || row.customerId}
          </Link>
        ) : '—',
    },
    {
      key: 'material',
      header: 'Stream',
      sortable: true,
      sortValue: (row) => materialMeta[row.material]?.label || row.material,
      render: (row) => <MaterialLabel material={row.material} />,
    },
    {
      key: 'estimatedWeight',
      header: 'Est. lbs',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="tabular-nums text-text-primary">
          {Number(row.estimatedWeight).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'preferredDate',
      header: 'Pref. date',
      sortable: true,
      align: 'center',
      render: (row) => {
        const urgency = row.effectiveStatus === 'under_review' ? tierColor(row._tier) : null;
        return <UrgencyPill urgency={urgency}>{formatDate(row.preferredDate)}</UrgencyPill>;
      },
    },
    {
      key: 'scheduledDate',
      header: 'Scheduled',
      sortable: true,
      align: 'center',
      sortValue: (row) => row.scheduledDate || '',
      render: (row) => {
        if (row.effectiveStatus !== 'scheduled' || !row.scheduledDate) {
          return <span className="font-sans text-[0.8125rem] text-text-muted/50">—</span>;
        }
        const urgency = tierColor(row._tier);
        const win = windowLabel(row.scheduledWindow);
        const label = `${formatDate(row.scheduledDate)}${win ? ` · ${win}` : ''}`;
        return (
          <UrgencyPill urgency={urgency} title={WINDOW_HOURS[row.scheduledWindow]}>
            {label}
          </UrgencyPill>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      align: 'center',
      sortValue: (row) => row.effectiveStatus,
      render: (row) => <StatusBadge status={row.effectiveStatus} />,
    },
    {
      key: 'action',
      header: '',
      align: 'center',
      render: (row) => {
        const s = row.effectiveStatus;
        if (s === 'completed' || s === 'cancelled') {
          return <span className="font-sans text-[0.75rem] text-text-muted">Closed</span>;
        }
        if (s === 'under_review') {
          const kebabOpen = openKebab?.id === row.id;
          return (
            <div className="flex justify-center">
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openSchedule(row); }}
                  className="rounded-sm border border-border bg-surface px-3 py-1 font-sans text-[0.75rem] font-semibold text-text-primary transition-colors hover:border-navy hover:bg-offwhite-alt"
                >
                  Schedule
                </button>
                <button
                  type="button"
                  aria-label="More actions"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (kebabOpen) { setOpenKebab(null); return; }
                    const rect = e.currentTarget.getBoundingClientRect();
                    setOpenKebab({ id: row.id, x: rect.right, y: rect.bottom + 4 });
                  }}
                  className="absolute left-full top-1/2 ml-1 -translate-y-1/2 rounded-sm p-1 text-text-muted transition-colors hover:bg-offwhite-alt hover:text-text-primary"
                >
                  <MoreVerticalIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        }
        const kebabOpen = openKebab?.id === row.id;
        return (
          <div className="flex justify-center">
            <div className="relative">
              <button
                type="button"
                title="Click to mark loaded · Shift+click to reschedule"
                onClick={(e) => { e.stopPropagation(); if (e.shiftKey) openSchedule(row); else markLoaded(row); }}
                className="rounded-sm bg-sage px-3 py-1 font-sans text-[0.75rem] font-semibold text-white transition-opacity hover:opacity-90"
              >
                Mark loaded
              </button>
              <button
                type="button"
                aria-label="More actions"
                onClick={(e) => {
                  e.stopPropagation();
                  if (kebabOpen) { setOpenKebab(null); return; }
                  const rect = e.currentTarget.getBoundingClientRect();
                  setOpenKebab({ id: row.id, x: rect.right, y: rect.bottom + 4 });
                }}
                className="absolute left-full top-1/2 ml-1 -translate-y-1/2 rounded-sm p-1 text-text-muted transition-colors hover:bg-offwhite-alt hover:text-text-primary"
              >
                <MoreVerticalIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PortalPageHeader title="Dispatch" />
      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 lg:px-8">
        <section className="mb-8 grid grid-cols-2 gap-6 border-b border-border pb-8 sm:grid-cols-4">
          <div>
            <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-text-muted">Open dispatches</p>
            <p className={'mt-2 font-serif text-[2rem] font-bold leading-none tabular-nums ' + (openCount > 0 ? 'text-accent' : 'text-text-primary')}>
              {openCount}
            </p>
          </div>
          <div>
            <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-text-muted">Active accounts</p>
            <p className="mt-2 font-serif text-[2rem] font-bold leading-none text-text-primary tabular-nums">
              {stats?.activeAccounts ?? '—'}
            </p>
          </div>
          <div>
            <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-text-muted">Scale inbound YTD</p>
            <p className="mt-2 font-serif text-[2rem] font-bold leading-none text-text-primary tabular-nums">
              {stats?.ytdWeight != null ? Number(stats.ytdWeight).toLocaleString() : '—'}
              <span className="ml-1.5 font-sans text-[0.875rem] font-normal text-text-muted">lbs</span>
            </p>
          </div>
          <div>
            <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-text-muted">Last load logged</p>
            <p className="mt-2 font-serif text-[1.375rem] font-semibold text-text-primary">
              {relativeTime(stats?.lastLoadAt)}
            </p>
          </div>
        </section>

        <div className="mb-5 grid grid-cols-1 gap-3 rounded-sm border border-border/70 bg-surface p-4 sm:grid-cols-[1fr_1fr_2fr]">
          <FormField label="Status">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="open">Open</option>
              <option value="under_review">Under review</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="all">All</option>
            </Select>
          </FormField>
          <FormField label="Stream">
            <Select value={streamFilter} onChange={(e) => setStreamFilter(e.target.value)}>
              <option value="all">All streams</option>
              {Object.keys(materialMeta).map((k) => (
                <option key={k} value={k}>{materialMeta[k].label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Account">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="search"
                placeholder="Search by account…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-sm border border-border bg-surface py-3 pl-9 pr-3 font-sans text-[0.875rem] text-text-primary placeholder:text-text-muted/70 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15"
              />
            </div>
          </FormField>
        </div>

        <DataTable
          columns={columns}
          data={rows}
          sort={sort}
          onSortChange={setSort}
          pageSize={20}
          headerAction={
            sort ? (
              <button
                type="button"
                onClick={() => setSort(null)}
                title="Reset to smart sort"
                aria-label="Reset to smart sort"
                className="flex h-7 w-7 items-center justify-center rounded-sm bg-transparent text-text-muted transition-colors hover:text-text-primary"
              >
                <RefreshIcon className="h-3.5 w-3.5" />
              </button>
            ) : null
          }
          emptyState={
            <div>
              <p className="font-serif text-[1.125rem] font-semibold text-text-primary">Nothing to dispatch</p>
              <p className="mt-1 font-sans text-[0.875rem] text-text-muted">
                {query || streamFilter !== 'all' || statusFilter !== 'open'
                  ? 'Try a different filter.'
                  : 'Everything in the yard is handled.'}
              </p>
            </div>
          }
        />
      </div>

      {openKebab && typeof document !== 'undefined' && createPortal(
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ position: 'fixed', top: openKebab.y, right: window.innerWidth - openKebab.x, zIndex: 9999 }}
          className="min-w-[9rem] overflow-hidden rounded-sm border border-border/70 bg-surface py-1 shadow-md"
        >
          <button
            type="button"
            onClick={() => { setOpenKebab(null); openSchedule(rows.find((r) => r.id === openKebab.id)); }}
            className="block w-full px-3 py-1.5 text-left font-sans text-[0.8125rem] text-text-primary transition-colors hover:bg-offwhite-alt"
          >
            Reschedule
          </button>
          <button
            type="button"
            onClick={() => { setOpenKebab(null); setModal({ mode: 'delete', row: rows.find((r) => r.id === openKebab.id) }); }}
            className="block w-full px-3 py-1.5 text-left font-sans text-[0.8125rem] text-accent transition-colors hover:bg-accent-light"
          >
            Delete
          </button>
        </div>,
        document.body
      )}

      {modal && modal.mode !== 'delete' && (
        <ScheduleModal
          row={modal.row}
          mode={modal.mode}
          onClose={() => setModal(null)}
          onApply={(date, window) => applySchedule(modal.row, date, window)}
          onDelete={() => setModal({ mode: 'delete', row: modal.row })}
        />
      )}
      {modal && modal.mode === 'delete' && (
        <DeleteConfirm
          row={modal.row}
          onCancel={() => setModal(null)}
          onConfirm={() => deleteRequest(modal.row)}
        />
      )}
    </>
  );
}

function ScheduleModal({ row, mode, onClose, onApply, onDelete }) {
  const [date, setDate] = useState(row.scheduledDate || row.preferredDate || '');
  const [win, setWin] = useState(
    row.scheduledWindow || (row.timeWindow === 'afternoon' ? 'afternoon' : 'morning')
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/40 p-4" onClick={onClose}>
      <div className="relative w-full max-w-md rounded-sm border border-border/70 bg-surface p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 rounded-sm p-1 text-text-muted transition-colors hover:bg-offwhite-alt hover:text-text-primary">
          <XIcon className="h-4 w-4" />
        </button>
        <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-text-muted">
          {mode === 'reschedule' ? 'Reschedule pickup' : 'Schedule pickup'}
        </p>
        <p className="mt-1 font-serif text-[1.375rem] font-semibold text-text-primary">
          {row.customerCompany || 'Request'}
        </p>
        <p className="mt-1 font-sans text-[0.8125rem] text-text-muted">
          {materialMeta[row.material]?.label || row.material} · {Number(row.estimatedWeight).toLocaleString()} lbs
        </p>

        <div className="mt-5 space-y-4">
          <FormField label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-sm border border-border bg-surface px-3 py-2.5 font-sans text-[0.875rem] text-text-primary focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15"
            />
          </FormField>
          <FormField label="Window">
            <Select value={win} onChange={(e) => setWin(e.target.value)}>
              <option value="morning">Morning · 8am–12pm</option>
              <option value="afternoon">Afternoon · 12pm–5pm</option>
            </Select>
          </FormField>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 font-sans text-[0.75rem] font-semibold text-text-muted transition-colors hover:bg-accent-light hover:text-accent"
          >
            <TrashIcon className="h-3.5 w-3.5" />
            Delete request
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-sm border border-border bg-surface px-4 py-2 font-sans text-[0.8125rem] font-semibold text-text-primary transition-colors hover:border-navy hover:bg-offwhite-alt">
              Cancel
            </button>
            <button type="button" disabled={!date} onClick={() => onApply(date, win)} className="rounded-sm bg-navy px-4 py-2 font-sans text-[0.8125rem] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ row, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/40 p-4" onClick={onCancel}>
      <div className="relative w-full max-w-sm rounded-sm border border-border/70 bg-surface p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <p className="font-serif text-[1.25rem] font-semibold text-text-primary">Delete this request?</p>
        <p className="mt-2 font-sans text-[0.875rem] text-text-muted">
          {row.customerCompany || 'This request'} will be removed from dispatch. This can&apos;t be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-sm border border-border bg-surface px-4 py-2 font-sans text-[0.8125rem] font-semibold text-text-primary transition-colors hover:border-navy hover:bg-offwhite-alt">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="rounded-sm bg-accent px-4 py-2 font-sans text-[0.8125rem] font-semibold text-white transition-opacity hover:opacity-90">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
