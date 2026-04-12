'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { PortalPageHeader } from '../PortalShell';
import { StatCard } from '../StatCard';
import { DataTable } from '../DataTable';
import { FormField, Select } from '../FormField';
import { MaterialLabel } from '../MaterialChip';
import { useToast } from '../Toast';
import { materialMeta } from '@/lib/materials';
import { deleteEntryAction } from '@/app/actions/entries';
import { TrashIcon } from '../icons';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// entries shape: [{ id, date, material, weight, notes, customerId, customerCompany }]
// customers shape: [{ id, company }]
export function AdminReporting({ entries: allEntries, customers }) {
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const [entries, setEntries] = useState(allEntries ?? []);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [customerId, setCustomerId] = useState('all');
  const [material, setMaterial] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const handleDelete = (entry) => {
    setConfirmDeleteId(null);
    setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    startTransition(async () => {
      const result = await deleteEntryAction(entry.id);
      if (result?.error) {
        setEntries((prev) => [...prev, entry]);
        toast({ title: 'Error', description: result.error });
      }
    });
  };

  const filtered = useMemo(() => {
    let data = entries;
    if (customerId !== 'all') data = data.filter((e) => e.customerId === customerId);
    if (material !== 'all') data = data.filter((e) => e.material === material);
    if (fromDate) data = data.filter((e) => e.date >= fromDate);
    if (toDate) data = data.filter((e) => e.date <= toDate);
    return data;
  }, [allEntries, customerId, material, fromDate, toDate]);

  const totalWeight = filtered.reduce((sum, e) => sum + Number(e.weight || 0), 0);
  const uniqueCustomers = new Set(filtered.map((e) => e.customerId)).size;
  const uniqueMaterials = new Set(filtered.map((e) => e.material)).size;

  const columns = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      defaultDirection: 'desc',
      render: (row) => formatDate(row.date),
    },
    {
      key: 'customerId',
      header: 'Account',
      sortable: true,
      sortValue: (row) => row.customerCompany || '',
      render: (row) =>
        row.customerId ? (
          <Link href={`/admin/customers/${row.customerId}`} className="font-medium text-navy-light hover:underline">
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
    {
      key: '_delete',
      header: '',
      align: 'center',
      render: (row) => (
        <button
          type="button"
          onClick={() => setConfirmDeleteId(row.id)}
          aria-label="Delete entry"
          className="rounded-sm p-1.5 text-text-muted transition-colors hover:bg-accent-light hover:text-accent"
        >
          <TrashIcon className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ];

  return (
    <>
      <PortalPageHeader title="Reporting" subtitle="Slice the yard log by account, stream, and window." />
      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 lg:px-8">
        <div className="mb-5 rounded-sm border border-border/70 bg-surface p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
            <FormField label="Account">
              <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="all">All accounts</option>
                {(customers ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.company}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Stream">
              <Select value={material} onChange={(e) => setMaterial(e.target.value)}>
                <option value="all">All streams</option>
                {Object.keys(materialMeta).map((k) => (
                  <option key={k} value={k}>{materialMeta[k].label}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="From">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-sm border border-border bg-surface px-3.5 py-3 font-sans text-[0.875rem] text-text-primary focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15"
              />
            </FormField>
            <FormField label="To">
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-sm border border-border bg-surface px-3.5 py-3 font-sans text-[0.875rem] text-text-primary focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15"
              />
            </FormField>
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => { setCustomerId('all'); setMaterial('all'); setFromDate(''); setToDate(''); }}
                className="h-[2.875rem] rounded-sm border border-border px-4 font-sans text-[0.8125rem] text-text-muted transition-colors hover:border-navy hover:text-text-primary"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Diverted" value={`${totalWeight.toLocaleString()} lbs`} />
          <StatCard label="Accounts" value={uniqueCustomers} />
          <StatCard label="Streams" value={uniqueMaterials} />
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          defaultSort={{ key: 'date', direction: 'desc' }}
          pageSize={20}
          emptyState={
            <div>
              <p className="font-serif text-[1.125rem] font-semibold text-text-primary">No loads match</p>
              <p className="mt-1 font-sans text-[0.875rem] text-text-muted">Loosen the filters.</p>
            </div>
          }
          footer={
            <button
              type="button"
              disabled
              title="Export coming soon"
              className="inline-flex items-center gap-2 rounded-sm border border-border bg-surface px-4 py-2 font-sans text-[0.75rem] font-medium text-text-muted opacity-60"
            >
              Export CSV
            </button>
          }
        />
      </div>

      {confirmDeleteId && (() => {
        const entry = entries.find((e) => e.id === confirmDeleteId);
        if (!entry) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/40 p-4" onClick={() => setConfirmDeleteId(null)}>
            <div className="w-full max-w-sm rounded-sm border border-border/70 bg-surface p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <p className="font-serif text-[1.25rem] font-semibold text-text-primary">Delete this entry?</p>
              <p className="mt-2 font-sans text-[0.875rem] text-text-muted">
                {entry.customerCompany || 'This entry'} · {Number(entry.weight).toLocaleString()} lbs · {entry.date}
              </p>
              <p className="mt-1 font-sans text-[0.8125rem] text-text-muted">This can&apos;t be undone.</p>
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setConfirmDeleteId(null)} className="rounded-sm border border-border bg-surface px-4 py-2 font-sans text-[0.8125rem] font-semibold text-text-primary transition-colors hover:border-navy hover:bg-offwhite-alt">
                  Cancel
                </button>
                <button type="button" onClick={() => handleDelete(entry)} className="rounded-sm bg-accent px-4 py-2 font-sans text-[0.8125rem] font-semibold text-white transition-opacity hover:opacity-90">
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
