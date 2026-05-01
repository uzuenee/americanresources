'use client';

import { useMemo, useState, useEffect, useRef, useTransition } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PortalPageHeader } from '../PortalShell';
import { DataTable } from '../DataTable';
import { StatusBadge } from '../StatusBadge';
import { FormField, Select } from '../FormField';
import { useToast } from '../Toast';
import { deletePost, duplicatePost } from '@/app/actions/content';
import { computeSEOScore } from '@/lib/seo-utils';
import {
  SearchIcon,
  FilePlusIcon,
  FileTextIcon,
  MoreVerticalIcon,
  TrashIcon,
  CopyIcon,
  ExternalLinkIcon,
  XIcon,
} from '../icons';
import { cn } from '@/utils/cn';

const STATUS_MAP = {
  published: { bg: 'bg-sage', text: 'text-white', label: 'Published' },
  draft: { bg: 'bg-offwhite-alt', text: 'text-text-muted', label: 'Draft', border: 'border border-border' },
  scheduled: { bg: 'bg-navy-light', text: 'text-white', label: 'Scheduled' },
};

function ContentStatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.draft;
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.08em]',
      s.bg, s.text, s.border
    )}>
      {s.label}
    </span>
  );
}

function StatCard({ label, value, accent }) {
  const accentColors = {
    sage: 'border-t-sage',
    copper: 'border-t-copper',
    navy: 'border-t-navy-light',
    neutral: 'border-t-border',
  };
  return (
    <div className={cn(
      'rounded-sm border border-border/70 bg-surface px-5 py-4 border-t-2',
      accentColors[accent] || accentColors.neutral
    )}>
      <p className="font-sans text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-text-muted">
        {label}
      </p>
      <p className="mt-1 font-serif text-[1.75rem] font-semibold text-text-primary">
        {value}
      </p>
    </div>
  );
}

function SEODot({ post }) {
  const checks = computeSEOScore(post);
  const failed = checks.filter((c) => c.status === 'fail').length;
  const warned = checks.filter((c) => c.status === 'warn').length;

  let color = 'bg-success';
  let title = 'SEO complete';
  if (failed > 0) {
    color = 'bg-danger';
    title = `${failed} SEO issue${failed > 1 ? 's' : ''} missing`;
  } else if (warned > 0) {
    color = 'bg-amber-500';
    title = `${warned} SEO warning${warned > 1 ? 's' : ''}`;
  }

  return (
    <span title={title} className="flex items-center justify-center">
      <span className={cn('inline-block h-2.5 w-2.5 rounded-full', color)} />
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getPublicPostPath(post) {
  return `/${post.type === 'guide' ? 'guides' : 'blog'}/${post.slug}`;
}

function KebabMenu({ post, onEdit, onDuplicate, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="flex h-8 w-8 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-offwhite-alt hover:text-text-primary"
        aria-label="Post actions"
      >
        <MoreVerticalIcon className="h-4 w-4" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-20 mt-1 w-40 rounded-sm border border-border bg-surface py-1 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
          <button
            type="button"
            role="menuitem"
            onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left font-sans text-[0.8125rem] text-text-primary transition-colors hover:bg-offwhite-alt"
          >
            <FileTextIcon className="h-3.5 w-3.5 text-text-muted" /> Edit
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={(e) => { e.stopPropagation(); setOpen(false); onDuplicate(); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left font-sans text-[0.8125rem] text-text-primary transition-colors hover:bg-offwhite-alt"
          >
            <CopyIcon className="h-3.5 w-3.5 text-text-muted" /> Duplicate
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              if (post.status === 'published') {
                window.open(getPublicPostPath(post), '_blank');
              }
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left font-sans text-[0.8125rem] text-text-primary transition-colors hover:bg-offwhite-alt"
          >
            <ExternalLinkIcon className="h-3.5 w-3.5 text-text-muted" /> Preview
          </button>
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            role="menuitem"
            onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left font-sans text-[0.8125rem] text-danger transition-colors hover:bg-accent-light"
          >
            <TrashIcon className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

function DeleteModal({ post, onConfirm, onCancel }) {
  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [onCancel]);

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="delete-title">
      <div className="absolute inset-0 bg-navy-dark/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-sm border border-border/70 bg-surface p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="delete-title" className="font-serif text-[1.375rem] font-semibold text-text-primary">
              Delete &ldquo;{post.title}&rdquo;?
            </h2>
            <p className="mt-1 font-sans text-[0.8125rem] text-text-muted">
              This action cannot be undone. The post will be permanently removed.
            </p>
          </div>
          <button type="button" onClick={onCancel} className="flex-shrink-0 rounded-sm p-1 text-text-muted transition-colors hover:bg-offwhite-alt hover:text-text-primary" aria-label="Close">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-sm border border-border bg-surface px-4 py-2 font-sans text-[0.8125rem] font-medium text-text-muted transition-colors hover:border-navy hover:text-text-primary">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="rounded-sm bg-danger px-5 py-2 font-sans text-[0.8125rem] font-semibold text-white transition-colors hover:bg-danger/90">
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function ContentDashboard({ posts: initialPosts, categories }) {
  const router = useRouter();
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const [posts, setPosts] = useState(initialPosts ?? []);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const stats = useMemo(() => {
    const published = posts.filter((p) => p.status === 'published').length;
    const drafts = posts.filter((p) => p.status === 'draft').length;
    const scheduled = posts.filter((p) => p.status === 'scheduled').length;
    const totalViews = posts.reduce((sum, p) => sum + (p.viewCount || 0), 0);
    return { published, drafts, scheduled, totalViews };
  }, [posts]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (query && !p.title.toLowerCase().includes(query.toLowerCase())) return false;
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && p.categoryId !== categoryFilter) return false;
      return true;
    });
  }, [posts, query, typeFilter, statusFilter, categoryFilter]);

  const handleDuplicate = (post) => {
    startTransition(async () => {
      const result = await duplicatePost(post.id);
      if (result.ok) {
        toast({ title: 'Post duplicated', description: 'A draft copy has been created.' });
        router.refresh();
      } else {
        toast({ title: 'Failed to duplicate', description: result.error, variant: 'error' });
      }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    startTransition(async () => {
      const result = await deletePost(id);
      if (result.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        toast({ title: 'Post deleted' });
      } else {
        toast({ title: 'Failed to delete', description: result.error, variant: 'error' });
      }
      setDeleteTarget(null);
    });
  };

  const TYPE_BADGE = {
    blog: 'bg-navy-pale text-navy',
    guide: 'bg-copper-light/60 text-copper-dark',
  };

  const columns = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      sortValue: (row) => row.title,
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-sans text-[0.9375rem] font-semibold text-navy group-hover:underline">
            {row.title}
          </p>
          {row.excerpt && (
            <p className="mt-0.5 truncate font-sans text-[0.8125rem] text-text-muted">
              {row.excerpt}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      className: 'w-[100px]',
      render: (row) => (
        <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-[0.6875rem] font-semibold capitalize', TYPE_BADGE[row.type])}>
          {row.type}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      sortValue: (row) => row.categoryName || '',
      className: 'w-[140px]',
      render: (row) => row.categoryName ? (
        <span className="inline-flex items-center rounded-full bg-offwhite-alt px-3 py-1 font-sans text-[0.75rem] font-medium text-text-primary">
          {row.categoryName}
        </span>
      ) : <span className="text-text-muted">—</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      className: 'w-[120px]',
      render: (row) => <ContentStatusBadge status={row.status} />,
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      sortValue: (row) => row.publishedAt || row.scheduledAt || row.createdAt,
      defaultDirection: 'desc',
      className: 'w-[140px] whitespace-nowrap',
      render: (row) => (
        <span className="font-sans text-[0.8125rem] text-text-muted whitespace-nowrap">
          {formatDate(row.publishedAt || row.scheduledAt)}
        </span>
      ),
    },
    {
      key: 'seo',
      header: 'SEO',
      className: 'w-[70px]',
      align: 'center',
      render: (row) => <SEODot post={{ ...row, body: row.hasBody ? [{ type: 'h2', content: 'x' }] : [] }} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-[48px]',
      render: (row) => (
        <KebabMenu
          post={row}
          onEdit={() => router.push(`/admin/content/${row.id}`)}
          onDuplicate={() => handleDuplicate(row)}
          onDelete={() => setDeleteTarget(row)}
        />
      ),
    },
  ];

  return (
    <>
      <PortalPageHeader
        title="Content"
        subtitle={`${posts.length} total post${posts.length !== 1 ? 's' : ''}`}
        breadcrumbs={[{ label: 'Content' }]}
      />

      <div className="px-6 py-6 lg:px-10 lg:py-8">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Published" value={stats.published} accent="sage" />
          <StatCard label="Drafts" value={stats.drafts} accent="copper" />
          <StatCard label="Scheduled" value={stats.scheduled} accent="navy" />
          <StatCard label="Total Views" value={stats.totalViews.toLocaleString()} accent="neutral" />
        </div>

        {/* Filter bar */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-1 flex-wrap items-end gap-3">
            <div className="w-full max-w-xs">
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search posts by title..."
                  aria-label="Search posts"
                  className="w-full rounded-sm border border-border bg-surface py-2.5 pl-9 pr-3 font-sans text-[0.875rem] text-text-primary placeholder:text-text-muted/60 transition-colors focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15"
                />
              </div>
            </div>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-auto min-w-[120px] !py-2.5 !text-[0.875rem]" aria-label="Filter by type">
              <option value="all">All Types</option>
              <option value="blog">Blog</option>
              <option value="guide">Guide</option>
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-auto min-w-[130px] !py-2.5 !text-[0.875rem]" aria-label="Filter by status">
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </Select>
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-auto min-w-[130px] !py-2.5 !text-[0.875rem]" aria-label="Filter by category">
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <Link
            href="/admin/content/new"
            className="inline-flex items-center gap-2 rounded-sm bg-copper px-5 py-2.5 font-sans text-[0.875rem] font-semibold text-white transition-colors hover:bg-copper-dark"
          >
            <FilePlusIcon className="h-4 w-4" />
            New Post
          </Link>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filtered}
          defaultSort={{ key: 'date', direction: 'desc' }}
          onRowClick={(row) => router.push(`/admin/content/${row.id}`)}
          emptyState={
            <div className="py-12 text-center">
              <FileTextIcon className="mx-auto mb-3 h-12 w-12 text-text-muted/40" />
              <p className="font-serif text-lg font-semibold text-text-primary">No content yet</p>
              <p className="mt-1 font-sans text-[0.875rem] text-text-muted">
                Create your first blog post or guide to get started.
              </p>
              <Link
                href="/admin/content/new"
                className="mt-4 inline-flex items-center gap-2 rounded-sm bg-copper px-5 py-2.5 font-sans text-[0.875rem] font-semibold text-white transition-colors hover:bg-copper-dark"
              >
                <FilePlusIcon className="h-4 w-4" />
                Create your first post
              </Link>
            </div>
          }
        />
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteModal
          post={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
