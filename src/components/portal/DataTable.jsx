'use client';

import { useMemo, useState, memo } from 'react';
import { cn } from '@/utils/cn';
import { ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

function compareValues(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

const Row = memo(function Row({ row, columns, onClick }) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'group transition-colors duration-150',
        onClick && 'cursor-pointer',
        'hover:bg-[#F5F0E8]'
      )}
    >
      {columns.map((col) => (
        <td
          key={col.key}
          className={cn(
            'px-4 py-4 font-sans align-middle',
            col.align === 'right' && 'text-right',
            col.align === 'center' && 'text-center',
            col.className
          )}
        >
          {col.render ? col.render(row) : row[col.key]}
        </td>
      ))}
    </tr>
  );
});

export function DataTable({
  columns,
  data,
  defaultSort,
  pageSize = 20,
  onRowClick,
  emptyState,
  footer,
  sort: controlledSort,
  onSortChange,
  headerAction,
}) {
  const [internalSort, setInternalSort] = useState(defaultSort || null);
  const isControlled = controlledSort !== undefined;
  const sort = isControlled ? controlledSort : internalSort;
  const [page, setPage] = useState(1);

  const sortedData = useMemo(() => {
    if (!sort) return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return data;
    const getValue = col.sortValue || ((row) => row[col.key]);
    const sorted = [...data].sort((a, b) =>
      compareValues(getValue(a), getValue(b)) * (sort.direction === 'desc' ? -1 : 1)
    );
    return sorted;
  }, [data, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageRows = sortedData.slice(pageStart, pageStart + pageSize);

  const handleSort = (col) => {
    if (!col.sortable) return;
    const next = (() => {
      if (sort?.key === col.key) {
        return { key: col.key, direction: sort.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key: col.key, direction: col.defaultDirection || 'desc' };
    })();
    if (!isControlled) setInternalSort(next);
    onSortChange?.(next);
    setPage(1);
  };

  if (data.length === 0 && emptyState) {
    return (
      <div className="rounded-sm border border-border/70 bg-surface p-12 text-center">
        {emptyState}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-sm border border-border/70 bg-surface">
      {headerAction && (
        <div className="pointer-events-none absolute right-3 top-0 z-10 flex h-[2.5rem] items-center">
          <div className="pointer-events-auto">{headerAction}</div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-offwhite-alt">
              {columns.map((col) => {
                const active = sort?.key === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    onClick={() => handleSort(col)}
                    className={cn(
                      'px-4 py-3 font-serif text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-text-muted',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                      !col.align && 'text-left',
                      col.sortable && 'cursor-pointer select-none hover:text-text-primary'
                    )}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable && active && (
                        sort.direction === 'asc'
                          ? <ChevronUpIcon className="h-3 w-3" />
                          : <ChevronDownIcon className="h-3 w-3" />
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {pageRows.map((row, idx) => (
              <Row
                key={row.id || idx}
                row={row}
                columns={columns}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              />
            ))}
          </tbody>
        </table>
      </div>
      {(totalPages > 1 || footer) && (
        <div className="flex flex-col items-start justify-between gap-3 border-t border-border/60 px-4 py-3 sm:flex-row sm:items-center">
          <p className="font-sans text-[0.8125rem] text-text-muted">
            Showing {pageStart + 1}&ndash;{Math.min(pageStart + pageSize, sortedData.length)} of {sortedData.length} entries
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="rounded-sm p-1.5 text-text-muted transition-colors hover:bg-offwhite-alt disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .map((p, i, arr) => {
                  const prev = arr[i - 1];
                  return (
                    <span key={p} className="flex items-center gap-1">
                      {prev && p - prev > 1 && (
                        <span className="px-1 text-text-muted">&hellip;</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setPage(p)}
                        className={cn(
                          'min-w-[2rem] rounded-sm px-2 py-1 font-sans text-[0.8125rem] transition-colors',
                          p === safePage
                            ? 'bg-navy text-white'
                            : 'text-text-muted hover:bg-offwhite-alt hover:text-text-primary'
                        )}
                        aria-current={p === safePage ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    </span>
                  );
                })}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="rounded-sm p-1.5 text-text-muted transition-colors hover:bg-offwhite-alt disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          )}
          {footer}
        </div>
      )}
    </div>
  );
}
