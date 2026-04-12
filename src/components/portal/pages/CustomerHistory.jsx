'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PortalPageHeader } from '../PortalShell';
import { DataTable } from '../DataTable';
import { StatusBadge } from '../StatusBadge';
import { MaterialLabel } from '../MaterialChip';
import { FormField, Select } from '../FormField';
import { materialMeta } from '@/lib/materials';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function CustomerHistory({ entries: allEntries }) {
  const [material, setMaterial] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const entries = useMemo(() => {
    let data = allEntries ?? [];
    if (material !== 'all') data = data.filter((e) => e.material === material);
    if (fromDate) data = data.filter((e) => e.date >= fromDate);
    if (toDate) data = data.filter((e) => e.date <= toDate);
    return data;
  }, [allEntries, material, fromDate, toDate]);

  const columns = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      defaultDirection: 'desc',
      render: (row) => <span className="text-text-primary">{formatDate(row.date)}</span>,
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
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <>
      <PortalPageHeader title="Load history" subtitle="Every pull we've logged for your account." />
      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 lg:px-8">
        <div className="mb-5 grid grid-cols-1 gap-3 rounded-sm border border-border/70 bg-surface p-4 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <FormField label="Stream">
            <Select value={material} onChange={(e) => setMaterial(e.target.value)}>
              <option value="all">All streams</option>
              {Object.keys(materialMeta).map((key) => (
                <option key={key} value={key}>{materialMeta[key].label}</option>
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
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setMaterial('all');
                setFromDate('');
                setToDate('');
              }}
              className="h-[2.875rem] rounded-sm border border-border bg-surface px-5 font-sans text-[0.8125rem] font-medium text-text-muted transition-colors hover:border-navy hover:text-text-primary"
            >
              Reset
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={entries}
          defaultSort={{ key: 'date', direction: 'desc' }}
          pageSize={15}
          emptyState={
            <div>
              <p className="font-serif text-[1.25rem] font-semibold text-text-primary">
                No loads yet
              </p>
              <p className="mt-1 font-sans text-[0.875rem] text-text-muted">
                Your first pull will land here.
              </p>
              <Link
                href="/portal/request"
                className="mt-4 inline-flex items-center gap-2 rounded-sm border border-border bg-surface px-5 py-2.5 font-sans text-[0.8125rem] font-semibold text-text-primary transition-colors hover:border-navy hover:bg-offwhite-alt"
              >
                Request a pickup
              </Link>
            </div>
          }
        />
      </div>
    </>
  );
}
