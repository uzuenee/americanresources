'use client';

import { useActionState, useMemo, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { PortalPageHeader } from '../PortalShell';
import { Card, CardHeader, DefList } from '../Card';
import { DataTable } from '../DataTable';
import { StatusBadge } from '../StatusBadge';
import { MaterialChip, MaterialLabel } from '../MaterialChip';
import { FormField, Select, Textarea } from '../FormField';
import { useToast } from '../Toast';
import { materialMeta } from '@/lib/materials';
import { logManualEntryAction } from '@/app/actions/entries';
import { CheckCircleIcon, PhoneIcon, MailIcon } from '../icons';
import { cn } from '@/utils/cn';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso + (iso.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'history', label: 'History' },
  { id: 'requests', label: 'Requests' },
];

// customer shape: { id, company, status, since, location, reportingCadence,
//   materials, totalWeight, totalPickups, openRequests, contact: {...} }
// entries shape: [{ id, date, material, weight, notes, status }]
// requests shape: [{ id, material, estimatedWeight, preferredDate, timeWindow,
//   scheduledDate, scheduledWindow, status, submittedAt, accessInstructions }]
export function AdminCustomerDetail({ customer, entries, requests, initialTab }) {
  const [tab, setTab] = useState(TABS.find((t) => t.id === initialTab)?.id || 'overview');
  const reduceMotion = useReducedMotion();

  if (!customer) {
    notFound();
  }

  const openRequest = useMemo(
    () => (requests ?? []).find((r) => r.status !== 'completed' && r.status !== 'cancelled'),
    [requests]
  );

  return (
    <>
      <PortalPageHeader
        title={customer.company}
        subtitle={
          <span className="inline-flex items-center gap-2">
            <StatusBadge status={customer.status} />
            {customer.since && (
              <span>
                On file since{' '}
                {new Date(customer.since + 'T00:00:00').toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            )}
          </span>
        }
        breadcrumbs={[
          { label: 'Accounts', href: '/admin/customers' },
          { label: customer.company },
        ]}
      />
      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-6 lg:px-8">
        <div className="mb-6 border-b border-border">
          <nav aria-label="Customer sections" className="-mb-px flex gap-6">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'relative pb-3 font-sans text-[0.875rem] font-semibold transition-colors',
                    active ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'
                  )}
                >
                  {t.label}
                  {active && (
                    <m.span layoutId="admin-tab-underline" className="absolute inset-x-0 -bottom-px h-[2px] bg-copper" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <AnimatePresence mode="wait">
          <m.div
            key={tab}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {tab === 'overview' && (
              <OverviewTab customer={customer} openRequest={openRequest} />
            )}
            {tab === 'history' && <HistoryTab entries={entries ?? []} />}
            {tab === 'requests' && <RequestsTab requests={requests ?? []} />}
          </m.div>
        </AnimatePresence>
      </div>
    </>
  );
}

function OverviewTab({ customer, openRequest }) {
  const { toast } = useToast();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader title="Contact" />
          <DefList
            items={[
              { label: 'Company', value: customer.company },
              customer.contact?.name && {
                label: 'Contact',
                value: `${customer.contact.name}${customer.contact.title ? `, ${customer.contact.title}` : ''}`,
              },
              customer.contact?.email && {
                label: 'Email',
                value: (
                  <a href={`mailto:${customer.contact.email}`} className="inline-flex items-center gap-1.5 text-navy-light hover:underline">
                    <MailIcon className="h-3 w-3" /> {customer.contact.email}
                  </a>
                ),
              },
              customer.contact?.phone && {
                label: 'Phone',
                value: (
                  <a href={`tel:${customer.contact.phone.replace(/[^0-9+]/g, '')}`} className="inline-flex items-center gap-1.5 text-navy-light hover:underline">
                    <PhoneIcon className="h-3 w-3" /> {customer.contact.phone}
                  </a>
                ),
              },
              { label: 'Location', value: customer.location || '—' },
            ].filter(Boolean)}
          />
        </Card>
        <Card>
          <CardHeader title="Streams" />
          {customer.materials?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {customer.materials.map((m) => (
                <MaterialChip key={m} material={m} />
              ))}
            </div>
          ) : (
            <p className="font-sans text-[0.875rem] text-text-muted">No streams on file.</p>
          )}
        </Card>
        <LogEntryCard
          customer={customer}
          onLog={(weight, material) => {
            toast({
              title: 'Load logged',
              description: `${Number(weight).toLocaleString()} lbs ${materialMeta[material]?.label || material}`,
            });
          }}
        />
      </div>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader title="Ledger" />
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="font-serif text-[1.5rem] font-bold text-text-primary tabular-nums">
                {Number(customer.totalWeight || 0).toLocaleString()}{' '}
                <span className="text-[0.875rem] font-sans font-normal text-text-muted">lbs</span>
              </p>
              <p className="font-sans text-[0.75rem] uppercase tracking-wide text-text-muted">Diverted</p>
            </div>
            <div>
              <p className="font-serif text-[1.5rem] font-bold text-text-primary tabular-nums">
                {customer.totalPickups || 0}
              </p>
              <p className="font-sans text-[0.75rem] uppercase tracking-wide text-text-muted">Pulls logged</p>
            </div>
            <div>
              <p className="font-serif text-[1.5rem] font-bold text-text-primary tabular-nums">
                {customer.materials?.length || 0}
              </p>
              <p className="font-sans text-[0.75rem] uppercase tracking-wide text-text-muted">Streams in service</p>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Next pull" />
          {openRequest ? (
            <div>
              <div className="flex items-start justify-between gap-3">
                <MaterialLabel material={openRequest.material} />
                <StatusBadge status={openRequest.status} />
              </div>
              <p className="mt-3 font-sans text-[0.8125rem] text-text-muted">
                {formatDate(openRequest.preferredDate)} ·{' '}
                {openRequest.timeWindow === 'morning'
                  ? 'Morning'
                  : openRequest.timeWindow === 'afternoon'
                    ? 'Afternoon'
                    : 'Any time'}
                {' · '}
                <span className="tabular-nums">
                  {Number(openRequest.estimatedWeight || 0).toLocaleString()} lbs est.
                </span>
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-sm bg-sage-light p-3">
              <CheckCircleIcon className="h-4 w-4 text-sage" />
              <p className="font-sans text-[0.8125rem] text-text-primary">Nothing waiting.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function LogEntryCard({ customer, onLog }) {
  // Bind customerId server-side so the action can't be spoofed.
  const boundAction = logManualEntryAction.bind(null, customer.id);
  const [state, formAction, isPending] = useActionState(boundAction, {
    fieldErrors: {},
    error: null,
  });

  const defaultMaterial = customer.materials?.[0] || 'metal';
  const [material, setMaterial] = useState(defaultMaterial);

  // Fire the toast on success (state.ok)
  const prevOk = useState(false);
  if (state?.ok && !prevOk[0]) {
    prevOk[1](true);
    onLog(state._weight, material);
  }
  if (!state?.ok && prevOk[0]) prevOk[1](false);

  const fe = state?.fieldErrors ?? {};

  return (
    <Card>
      <CardHeader title="Log a load" />
      <form action={formAction} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FormField label="Date" error={fe.entryDate}>
            <input
              type="date"
              name="entryDate"
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="w-full rounded-sm border border-border bg-surface px-3.5 py-3 font-sans text-[0.875rem] text-text-primary focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15"
            />
          </FormField>
          <FormField label="Stream" error={fe.material}>
            <Select name="material" value={material} onChange={(e) => setMaterial(e.target.value)}>
              {Object.keys(materialMeta)
                .filter((k) => k !== 'mixed')
                .map((key) => (
                  <option key={key} value={key}>{materialMeta[key].label}</option>
                ))}
            </Select>
          </FormField>
          <FormField label="Weight (lbs)" name="weight" placeholder="e.g., 1,250" type="number" error={fe.weight} />
        </div>
        <FormField label="Notes">
          <Textarea name="notes" rows={2} placeholder="Handling notes, asset tags, etc." />
        </FormField>
        {state?.error && (
          <p className="font-sans text-[0.8125rem] text-accent" role="alert">{state.error}</p>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-sm border-b-2 border-copper bg-accent px-5 py-2.5 font-sans text-[0.8125rem] font-semibold text-white transition-all duration-200 hover:bg-accent-hover active:scale-[0.98] disabled:opacity-70"
          >
            {isPending ? 'Logging…' : 'Log load'}
          </button>
        </div>
      </form>
    </Card>
  );
}

function HistoryTab({ entries }) {
  const columns = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      defaultDirection: 'desc',
      render: (row) => formatDate(row.date),
    },
    {
      key: 'material',
      header: 'Stream',
      sortable: true,
      sortValue: (row) => materialMeta[row.material]?.label || row.material,
      render: (row) => <MaterialLabel material={row.material} />,
    },
    {
      key: 'weight',
      header: 'Weight',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="tabular-nums">
          <span className="font-semibold text-text-primary">{Number(row.weight).toLocaleString()}</span>{' '}
          <span className="text-text-muted">lbs</span>
        </span>
      ),
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (row) => (
        <span className="block max-w-xs truncate font-sans text-[0.8125rem] text-text-muted" title={row.notes}>
          {row.notes || '—'}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <DataTable
      columns={columns}
      data={entries}
      defaultSort={{ key: 'date', direction: 'desc' }}
      pageSize={15}
      emptyState={
        <div>
          <p className="font-serif text-[1.125rem] font-semibold text-text-primary">No loads yet</p>
          <p className="mt-1 font-sans text-[0.875rem] text-text-muted">Log one from the Overview tab.</p>
        </div>
      }
    />
  );
}

function RequestsTab({ requests }) {
  const columns = [
    {
      key: 'submittedAt',
      header: 'Submitted',
      sortable: true,
      defaultDirection: 'desc',
      render: (row) => formatDate(row.submittedAt),
    },
    {
      key: 'material',
      header: 'Stream',
      sortable: true,
      sortValue: (row) => materialMeta[row.material]?.label || row.material,
      render: (row) => <MaterialLabel material={row.material} />,
    },
    { key: 'preferredDate', header: 'Pref. date', sortable: true, render: (row) => formatDate(row.preferredDate) },
    {
      key: 'timeWindow',
      header: 'Window',
      render: (row) =>
        row.timeWindow === 'morning' ? 'Morning' : row.timeWindow === 'afternoon' ? 'Afternoon' : 'No preference',
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'accessInstructions',
      header: 'Notes',
      render: (row) => (
        <span className="block max-w-[14rem] truncate font-sans text-[0.8125rem] text-text-muted" title={row.accessInstructions}>
          {row.accessInstructions || '—'}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={requests}
      defaultSort={{ key: 'submittedAt', direction: 'desc' }}
      pageSize={15}
      emptyState={
        <div>
          <p className="font-serif text-[1.125rem] font-semibold text-text-primary">No requests on file</p>
          <p className="mt-1 font-sans text-[0.875rem] text-text-muted">Account can submit from their portal.</p>
        </div>
      }
    />
  );
}
