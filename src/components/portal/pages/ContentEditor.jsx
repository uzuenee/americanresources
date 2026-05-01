'use client';

import { useState, useEffect, useRef, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { PortalPageHeader } from '../PortalShell';
import { FormField, Select, Textarea } from '../FormField';
import { useToast } from '../Toast';
import { createPost, updatePost, createCategory, createTag } from '@/app/actions/content';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { computeSEOScore, seoCompletionCount } from '@/lib/seo-utils';
import { parseMarkdown } from '@/lib/markdown-parser';
import { slugify, computeWordCount, computeReadingTime } from '@/lib/article-utils';
import {
  ArrowLeftIcon,
  SearchIcon,
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  GripVerticalIcon,
  FileTextIcon,
  ImageIcon,
  TypeIcon,
  ListIcon,
  QuoteIcon,
  AlertTriangleIcon,
  LightbulbIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  XIcon,
  UploadIcon,
} from '../icons';
import { cn } from '@/utils/cn';

const BLOCK_TYPES = [
  { type: 'p', label: 'Paragraph', icon: TypeIcon },
  { type: 'h2', label: 'Heading (H2)', icon: TypeIcon },
  { type: 'h3', label: 'Heading (H3)', icon: TypeIcon },
  { type: 'list', label: 'List', icon: ListIcon },
  { type: 'pullquote', label: 'Quote', icon: QuoteIcon },
  { type: 'callout', label: 'Callout (Tip)', icon: LightbulbIcon },
  { type: 'callout-warning', label: 'Callout (Warning)', icon: AlertTriangleIcon },
  { type: 'image', label: 'Image', icon: ImageIcon },
];

function newBlock(type) {
  if (type === 'callout-warning') return { type: 'callout', variant: 'warning', content: '' };
  if (type === 'callout') return { type: 'callout', variant: 'tip', content: '' };
  if (type === 'list') return { type: 'list', ordered: false, items: [''] };
  if (type === 'image') return { type: 'image', src: '', alt: '', caption: '', variant: 'column' };
  if (type === 'pullquote') return { type: 'pullquote', content: '', attribution: '' };
  return { type, content: '' };
}

function BlockTypeLabel({ type, variant }) {
  const labels = { p: 'PARAGRAPH', h2: 'HEADING H2', h3: 'HEADING H3', h4: 'HEADING H4', list: 'LIST', pullquote: 'QUOTE', callout: variant === 'warning' ? 'WARNING' : 'TIP', image: 'IMAGE', code: 'CODE', hr: 'DIVIDER', table: 'TABLE' };
  return (
    <span className="font-sans text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-text-muted">
      {labels[type] || type.toUpperCase()}
    </span>
  );
}

function BlockItem({ block, index, expanded, onToggle, onChange, onDelete }) {
  const preview = block.content || block.items?.join(', ') || block.src || '';

  return (
    <div className="group rounded-sm border border-border/70 bg-surface transition-colors hover:border-border">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <GripVerticalIcon className="h-4 w-4 flex-shrink-0 cursor-grab text-text-muted/40" />
        <BlockTypeLabel type={block.type} variant={block.variant} />
        {!expanded && (
          <p className="min-w-0 flex-1 truncate font-sans text-[0.8125rem] text-text-muted">
            {preview.slice(0, 120)}
          </p>
        )}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={onToggle}
            className="rounded-sm p-1 text-text-muted transition-colors hover:bg-offwhite-alt hover:text-text-primary"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUpIcon className="h-3.5 w-3.5" /> : <ChevronDownIcon className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-sm p-1 text-text-muted/40 opacity-0 transition-all group-hover:opacity-100 focus-visible:opacity-100 hover:text-danger"
            aria-label="Delete block"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-border/50 px-4 py-3">
          {(block.type === 'p' || block.type === 'h2' || block.type === 'h3' || block.type === 'h4' || block.type === 'code') && (
            <textarea
              value={block.content}
              onChange={(e) => onChange({ ...block, content: e.target.value })}
              rows={block.type === 'p' ? 4 : 2}
              className="w-full rounded-sm border border-border bg-offwhite px-3 py-2 font-sans text-[0.875rem] leading-relaxed text-text-primary placeholder:text-text-muted/50 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15"
              placeholder={`Enter ${block.type === 'p' ? 'paragraph text' : 'heading text'}...`}
            />
          )}
          {block.type === 'pullquote' && (
            <div className="space-y-2">
              <textarea
                value={block.content}
                onChange={(e) => onChange({ ...block, content: e.target.value })}
                rows={2}
                className="w-full rounded-sm border border-border bg-offwhite px-3 py-2 font-sans text-[0.875rem] italic leading-relaxed text-text-primary focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15"
                placeholder="Quote text..."
              />
              <input
                value={block.attribution || ''}
                onChange={(e) => onChange({ ...block, attribution: e.target.value })}
                className="w-full rounded-sm border border-border bg-offwhite px-3 py-2 font-sans text-[0.8125rem] text-text-primary focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15"
                placeholder="Attribution (optional)"
              />
            </div>
          )}
          {block.type === 'callout' && (
            <div className="space-y-2">
              <select
                value={block.variant || 'tip'}
                onChange={(e) => onChange({ ...block, variant: e.target.value })}
                aria-label="Callout variant"
                className="rounded-sm border border-border bg-offwhite px-3 py-2 font-sans text-[0.8125rem] focus:border-navy focus:outline-none"
              >
                <option value="tip">Tip</option>
                <option value="warning">Warning</option>
                <option value="compliance">Compliance</option>
                <option value="note">Note</option>
              </select>
              <textarea
                value={block.content}
                onChange={(e) => onChange({ ...block, content: e.target.value })}
                rows={3}
                className="w-full rounded-sm border border-border bg-offwhite px-3 py-2 font-sans text-[0.875rem] leading-relaxed text-text-primary focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15"
                placeholder="Callout content..."
              />
            </div>
          )}
          {block.type === 'list' && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-sans text-[0.8125rem] text-text-muted">
                <input
                  type="checkbox"
                  checked={block.ordered || false}
                  onChange={(e) => onChange({ ...block, ordered: e.target.checked })}
                  className="rounded-sm"
                />
                Numbered list
              </label>
              {(block.items || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="font-sans text-[0.75rem] text-text-muted w-5 text-right">
                    {block.ordered ? `${idx + 1}.` : '\u2022'}
                  </span>
                  <input
                    value={item}
                    onChange={(e) => {
                      const items = [...block.items];
                      items[idx] = e.target.value;
                      onChange({ ...block, items });
                    }}
                    className="flex-1 rounded-sm border border-border bg-offwhite px-3 py-1.5 font-sans text-[0.875rem] text-text-primary focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15"
                    placeholder="List item..."
                  />
                  <button
                    type="button"
                    onClick={() => onChange({ ...block, items: block.items.filter((_, i) => i !== idx) })}
                    aria-label="Remove list item"
                    className="p-1 text-text-muted/40 hover:text-danger"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => onChange({ ...block, items: [...(block.items || []), ''] })}
                className="flex items-center gap-1 font-sans text-[0.8125rem] font-medium text-copper hover:text-copper-dark"
              >
                <PlusIcon className="h-3 w-3" /> Add item
              </button>
            </div>
          )}
          {block.type === 'image' && (
            <div className="space-y-2">
              <input
                value={block.src || ''}
                onChange={(e) => onChange({ ...block, src: e.target.value })}
                className="w-full rounded-sm border border-border bg-offwhite px-3 py-2 font-sans text-[0.8125rem] text-text-primary focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15"
                placeholder="Image URL or path..."
              />
              <input
                value={block.alt || ''}
                onChange={(e) => onChange({ ...block, alt: e.target.value })}
                className="w-full rounded-sm border border-border bg-offwhite px-3 py-2 font-sans text-[0.8125rem] text-text-primary focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15"
                placeholder="Alt text (required for SEO)"
              />
              <div className="flex gap-2">
                <input
                  value={block.caption || ''}
                  onChange={(e) => onChange({ ...block, caption: e.target.value })}
                  className="flex-1 rounded-sm border border-border bg-offwhite px-3 py-2 font-sans text-[0.8125rem] text-text-primary focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15"
                  placeholder="Caption (optional)"
                />
                <select
                  value={block.variant || 'column'}
                  onChange={(e) => onChange({ ...block, variant: e.target.value })}
                  aria-label="Image size"
                  className="rounded-sm border border-border bg-offwhite px-3 py-2 font-sans text-[0.8125rem] focus:border-navy focus:outline-none"
                >
                  <option value="column">Standard</option>
                  <option value="wide">Wide</option>
                  <option value="full-bleed">Full bleed</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MarkdownModal({ open, onClose, onImport }) {
  const [raw, setRaw] = useState('');
  const reduceMotion = useReducedMotion();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4" role="dialog" aria-modal="true" aria-labelledby="md-modal-title">
      <div className="absolute inset-0 bg-navy-dark/60 backdrop-blur-sm" onClick={onClose} />
      <m.div
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-2xl rounded-sm border border-border/70 bg-surface shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
      >
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <h2 id="md-modal-title" className="font-serif text-[1.25rem] font-semibold text-text-primary">Paste Markdown</h2>
          <button type="button" onClick={onClose} className="rounded-sm p-1 text-text-muted hover:text-text-primary">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={14}
            className="w-full rounded-sm border border-navy-dark/30 bg-navy-dark px-4 py-3 font-mono text-[0.8125rem] leading-relaxed text-text-on-dark placeholder:text-text-on-dark/40 focus:outline-none focus:ring-2 focus:ring-copper/40"
            placeholder="Paste your markdown content here..."
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-3 border-t border-border/60 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-sm border border-border px-4 py-2 font-sans text-[0.8125rem] font-medium text-text-muted hover:text-text-primary">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => { onImport(parseMarkdown(raw)); setRaw(''); }}
            disabled={!raw.trim()}
            className="rounded-sm bg-copper px-5 py-2 font-sans text-[0.8125rem] font-semibold text-white transition-colors hover:bg-copper-dark disabled:opacity-50"
          >
            Parse &amp; Import
          </button>
        </div>
      </m.div>
    </div>
  );
}

function CollapsiblePanel({ title, defaultOpen = true, badge, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-sm border border-border/70 bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <span className="font-serif text-[1rem] font-semibold text-text-primary">{title}</span>
        <span className="flex items-center gap-2">
          {badge && <span className="font-sans text-[0.75rem] text-text-muted">{badge}</span>}
          <ChevronDownIcon className={cn('h-4 w-4 text-text-muted transition-transform', open && 'rotate-180')} />
        </span>
      </button>
      {open && <div className="border-t border-border/50 px-5 py-4">{children}</div>}
    </div>
  );
}

function SEOChecklist({ post }) {
  const checks = computeSEOScore(post);
  const icons = { pass: '\u2713', warn: '!', fail: '\u2717' };
  const colors = { pass: 'text-success', warn: 'text-amber-500', fail: 'text-danger' };
  return (
    <ul className="mt-4 space-y-2">
      {checks.map((c, i) => (
        <li key={i} className="flex items-center gap-2 font-sans text-[0.8125rem]">
          <span className={cn('font-bold', colors[c.status])}>{icons[c.status]}</span>
          <span className={c.status === 'pass' ? 'text-text-muted' : 'text-text-primary'}>{c.label}</span>
        </li>
      ))}
    </ul>
  );
}

function getPublicTypeSegment(type) {
  return type === 'guide' ? 'guides' : 'blog';
}

function GooglePreview({ title, slug, description, type }) {
  const siteHost =
    process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL).host
      : 'localhost:3000';
  const displayUrl = `${siteHost}/${getPublicTypeSegment(type)}/${slug || '...'}`;
  return (
    <div className="mt-4 rounded-sm border border-border/60 bg-offwhite p-4">
      <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-text-muted mb-2">Search Preview</p>
      <p className="font-sans text-[1rem] text-[#1a0dab] leading-snug truncate">{title || 'Page Title'}</p>
      <p className="font-sans text-[0.8125rem] text-[#006621] truncate">{displayUrl}</p>
      <p className="mt-0.5 font-sans text-[0.8125rem] text-text-muted line-clamp-2 leading-relaxed">{description || 'Page description will appear here...'}</p>
    </div>
  );
}

export function ContentEditor({ post, categories = [], tags = [], allPosts = [] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const isEditing = !!post;

  // Form state
  const [title, setTitle] = useState(post?.title || '');
  const [titleError, setTitleError] = useState('');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [type, setType] = useState(post?.type || 'blog');
  const [categoryId, setCategoryId] = useState(post?.categoryId || '');
  const [tagIds, setTagIds] = useState(post?.tagIds || []);
  const [tagSearch, setTagSearch] = useState('');
  const [body, setBody] = useState(post?.body || []);
  const [keyTakeaways, setKeyTakeaways] = useState(post?.keyTakeaways || []);
  const [faqs, setFaqs] = useState(post?.faqs || []);
  const [footnotes, setFootnotes] = useState(post?.footnotes || []);
  const [relatedPostIds, setRelatedPostIds] = useState(post?.relatedPostIds || []);
  const [heroImage, setHeroImage] = useState(post?.heroImage || '');
  const [heroAlt, setHeroAlt] = useState(post?.heroAlt || '');
  const [heroCredit, setHeroCredit] = useState(post?.heroCredit || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription || '');
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonicalUrl || '');
  const [ogImage, setOgImage] = useState(post?.ogImage || '');
  const [schemaType, setSchemaType] = useState(post?.schemaType || 'Article');
  const [noindex, setNoindex] = useState(post?.noindex || false);
  const [author, setAuthor] = useState(post?.author || 'American Resources Team');
  const [readTimeOverride, setReadTimeOverride] = useState(post?.readTimeOverride || '');
  const [visibility, setVisibility] = useState(post?.visibility || 'public');
  const [disableComments, setDisableComments] = useState(post?.disableComments || false);
  const [publishDate, setPublishDate] = useState(post?.publishedAt ? post.publishedAt.split('T')[0] : post?.scheduledAt ? post.scheduledAt.split('T')[0] : '');
  const [status, setStatus] = useState(post?.status || 'draft');

  // UI state
  const [expandedBlocks, setExpandedBlocks] = useState({});
  const [mdModalOpen, setMdModalOpen] = useState(false);
  const [addBlockOpen, setAddBlockOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(post?.updatedAt ? new Date(post.updatedAt) : null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [localCategories, setLocalCategories] = useState(categories);
  const [localTags, setLocalTags] = useState(tags);
  const [dirty, setDirty] = useState(false);

  const addBlockRef = useRef(null);
  const fileInputRef = useRef(null);
  const heroFileRef = useRef(null);
  const hasMountedRef = useRef(false);
  const autosaveRef = useRef(null);
  const [heroUploading, setHeroUploading] = useState(false);

  const handleFileImport = useCallback(async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.title) setTitle(data.title);
      if (data.title) setSlug(slugify(data.title));
      if (data.excerpt) setExcerpt(data.excerpt);
      if (data.type) setType(data.type);
      if (data.heroImage) setHeroImage(data.heroImage);
      if (data.heroAlt) setHeroAlt(data.heroAlt);
      if (data.heroCredit) setHeroCredit(data.heroCredit);
      if (data.metaTitle) setMetaTitle(data.metaTitle);
      if (data.metaDescription) setMetaDescription(data.metaDescription);
      if (data.schemaType) setSchemaType(data.schemaType);
      if (data.author) setAuthor(data.author);
      if (data.keyTakeaways) setKeyTakeaways(data.keyTakeaways);
      if (data.faqs) setFaqs(data.faqs);
      if (data.footnotes) setFootnotes(data.footnotes);

      if (data.body) {
        const blocks = parseMarkdown(data.body);
        setBody(blocks);
      }

      if (data.category) {
        const match = localCategories.find(
          (c) => c.name.toLowerCase() === data.category.toLowerCase()
        );
        if (match) setCategoryId(match.id);
      }

      if (data.tags && Array.isArray(data.tags)) {
        const resolvedIds = [];
        for (const tagName of data.tags) {
          const existing = localTags.find(
            (t) => t.name.toLowerCase() === tagName.toLowerCase()
          );
          if (existing) {
            resolvedIds.push(existing.id);
          } else {
            const result = await createTag({ name: tagName });
            if (result.ok) {
              setLocalTags((prev) => [...prev, result.tag]);
              resolvedIds.push(result.tag.id);
            }
          }
        }
        setTagIds(resolvedIds);
      }

      toast({ title: 'Article imported', description: 'Review the fields and publish when ready.' });
    } catch (e) {
      toast({ title: 'Import failed', description: 'Invalid JSON file.', variant: 'error' });
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [localCategories, localTags, toast]);

  const handleHeroUpload = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file.', variant: 'error' });
      return;
    }
    setHeroUploading(true);
    try {
      const supabase = createBrowserClient();
      const ext = file.name.split('.').pop();
      const path = `hero/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('content-images').upload(path, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('content-images').getPublicUrl(path);
      setHeroImage(publicUrl);
      toast({ title: 'Image uploaded' });
    } catch (e) {
      toast({ title: 'Upload failed', description: e.message || 'Try again.', variant: 'error' });
    } finally {
      setHeroUploading(false);
      if (heroFileRef.current) heroFileRef.current.value = '';
    }
  }, [toast]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && title && !post?.slug) {
      setSlug(slugify(title));
    }
  }, [title, isEditing, post?.slug]);

  // Mark dirty on user edits after the initial form hydration.
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    setDirty(true);
  }, [
    title,
    excerpt,
    type,
    categoryId,
    tagIds,
    body,
    keyTakeaways,
    faqs,
    footnotes,
    relatedPostIds,
    heroImage,
    heroAlt,
    heroCredit,
    slug,
    metaTitle,
    metaDescription,
    canonicalUrl,
    ogImage,
    schemaType,
    noindex,
    author,
    readTimeOverride,
    visibility,
    disableComments,
    publishDate,
  ]);

  // Close add-block dropdown on outside click
  useEffect(() => {
    if (!addBlockOpen) return;
    const close = (e) => { if (addBlockRef.current && !addBlockRef.current.contains(e.target)) setAddBlockOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [addBlockOpen]);

  useEffect(() => {
    autosaveRef.current = () => handleSave(status || 'draft', true);
  });

  // Auto-save every 30s
  useEffect(() => {
    if (!isEditing || !dirty) return;
    const timer = setInterval(() => {
      autosaveRef.current?.();
    }, 30000);
    return () => clearInterval(timer);
  }, [isEditing, dirty]);

  const buildPostData = () => ({
    title,
    slug,
    excerpt,
    type,
    categoryId: categoryId || null,
    tagIds,
    body,
    keyTakeaways,
    faqs,
    footnotes,
    relatedPostIds,
    heroImage: heroImage || null,
    heroAlt: heroAlt || null,
    heroCredit: heroCredit || null,
    metaTitle: metaTitle || null,
    metaDescription: metaDescription || null,
    canonicalUrl: canonicalUrl || null,
    ogImage: ogImage || null,
    schemaType,
    noindex,
    author,
    readTimeOverride: readTimeOverride || null,
    visibility,
    disableComments,
    scheduledAt: publishDate && new Date(publishDate) > new Date() ? new Date(publishDate).toISOString() : null,
  });

  const handleSave = (targetStatus, silent = false, successMessage) => {
    if (!title.trim()) {
      setTitleError('Title is required.');
      if (!silent) {
        toast({
          title: 'Title is required',
          description: 'Enter a title before saving.',
          variant: 'error',
        });
      }
      return;
    }

    setSaving(true);
    startTransition(async () => {
      const data = { ...buildPostData(), status: targetStatus };
      let result;
      if (isEditing) {
        result = await updatePost(post.id, data);
      } else {
        result = await createPost(data);
      }

      setSaving(false);
      if (result.ok) {
        setDirty(false);
        setLastSaved(new Date());
        setStatus(targetStatus);
        if (!silent) {
          const msgs = { draft: 'Draft saved', published: 'Post published successfully', scheduled: `Post scheduled for ${publishDate}` };
          toast({ title: successMessage || msgs[targetStatus] || 'Saved' });
        }
        if (!isEditing && result.id) {
          router.replace(`/admin/content/${result.id}`);
        }
      } else {
        toast({ title: 'Failed to save', description: result.error, variant: 'error' });
      }
    });
  };

  const handleNewCategory = () => {
    if (!newCatName.trim()) return;
    startTransition(async () => {
      const result = await createCategory({ name: newCatName.trim(), postType: type });
      if (result.ok) {
        setLocalCategories((prev) => [...prev, result.category]);
        setCategoryId(result.category.id);
        setNewCatName('');
        setNewCatOpen(false);
      }
    });
  };

  const handleNewTag = (name) => {
    startTransition(async () => {
      const result = await createTag({ name });
      if (result.ok) {
        setLocalTags((prev) => [...prev, result.tag]);
        setTagIds((prev) => [...prev, result.tag.id]);
        setTagSearch('');
      }
    });
  };

  const toggleBlock = (i) => setExpandedBlocks((prev) => ({ ...prev, [i]: !prev[i] }));
  const updateBlock = (i, block) => setBody((prev) => prev.map((b, idx) => idx === i ? block : b));
  const deleteBlock = (i) => setBody((prev) => prev.filter((_, idx) => idx !== i));
  const addBlock = (type) => { setBody((prev) => [...prev, newBlock(type)]); setExpandedBlocks((prev) => ({ ...prev, [body.length]: true })); setAddBlockOpen(false); };

  const seo = seoCompletionCount({ title, slug, excerpt, metaTitle, metaDescription, heroImage, heroAlt, body });
  const wordCount = computeWordCount(body);
  const readTime = computeReadingTime(body);
  const isScheduled = publishDate && new Date(publishDate) > new Date();
  const publishLabel = isEditing && status === 'published' ? 'Update' : isScheduled ? 'Schedule' : 'Publish';

  const filteredTags = localTags.filter((t) =>
    !tagIds.includes(t.id) && t.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  return (
    <>
      <PortalPageHeader
        title={isEditing ? 'Edit Post' : 'New Post'}
        breadcrumbs={[
          { label: 'Content', href: '/admin/content' },
          { label: isEditing ? title || 'Edit' : 'New Post' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="hidden font-sans text-[0.75rem] text-text-muted sm:inline">
                {saving ? 'Saving...' : `Last saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              </span>
            )}
            {status !== 'draft' && (
              <span className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.08em]',
                status === 'published' ? 'bg-sage text-white' : 'bg-navy-light text-white'
              )}>
                {status}
              </span>
            )}
          </div>
        }
      />

      <div className="px-6 py-6 lg:px-10 lg:py-8">
        <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="rounded-sm border border-border/70 bg-surface px-6 py-5">
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError('');
                }}
                aria-label="Post title"
                className={cn(
                  'w-full border-0 bg-transparent font-serif text-[1.5rem] font-semibold text-text-primary placeholder:text-text-muted/40 focus:outline-none',
                  titleError && 'rounded-sm ring-2 ring-danger/20'
                )}
                placeholder="Enter post title..."
              />
              {titleError && (
                <p className="mt-2 font-sans text-[0.75rem] text-danger" role="alert">
                  {titleError}
                </p>
              )}
              <div className="mt-4">
                <Textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  placeholder="A 1-2 sentence summary that appears in listings and social shares..."
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="flex rounded-sm border border-border">
                  {['blog', 'guide'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={cn(
                        'px-4 py-2 font-sans text-[0.8125rem] font-medium capitalize transition-colors',
                        type === t ? 'bg-copper text-white' : 'text-text-muted hover:text-text-primary'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="!py-2 !text-[0.8125rem] min-w-[160px]">
                    <option value="">Select a category...</option>
                    {localCategories.filter((c) => !c.post_type || c.post_type === type).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                  <div className="relative">
                    <button type="button" onClick={() => setNewCatOpen((v) => !v)} className="rounded-sm border border-border p-2 text-text-muted hover:text-copper" aria-label="Add category">
                      <PlusIcon className="h-4 w-4" />
                    </button>
                    {newCatOpen && (
                      <div className="absolute left-0 top-full z-20 mt-1 rounded-sm border border-border bg-surface p-3 shadow-lg">
                        <div className="flex items-center gap-2">
                          <input
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            className="rounded-sm border border-border bg-offwhite px-2 py-1 font-sans text-[0.8125rem] focus:outline-none focus:ring-2 focus:ring-navy/15"
                            placeholder="Category name"
                            autoFocus
                            onKeyDown={(e) => { if (e.key === 'Enter') handleNewCategory(); }}
                          />
                          <button type="button" onClick={handleNewCategory} className="rounded-sm bg-copper px-3 py-1 font-sans text-[0.75rem] font-semibold text-white hover:bg-copper-dark">Add</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Tags */}
              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-2">
                  {tagIds.map((id) => {
                    const tag = localTags.find((t) => t.id === id);
                    if (!tag) return null;
                    return (
                      <span key={id} className="inline-flex items-center gap-1 rounded-full bg-offwhite-alt px-3 py-1 font-sans text-[0.75rem] font-medium text-text-primary">
                        {tag.name}
                        <button type="button" onClick={() => setTagIds((prev) => prev.filter((t) => t !== id))} aria-label="Remove tag" className="text-text-muted hover:text-danger">
                          <XIcon className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                  <div className="relative">
                    <input
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      aria-label="Search tags"
                      className="rounded-sm border border-border bg-offwhite px-3 py-1.5 font-sans text-[0.8125rem] text-text-primary placeholder:text-text-muted/50 focus:border-navy focus:outline-none"
                      placeholder="Add tags..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && tagSearch.trim()) {
                          e.preventDefault();
                          const existing = localTags.find((t) => t.name.toLowerCase() === tagSearch.toLowerCase());
                          if (existing && !tagIds.includes(existing.id)) {
                            setTagIds((prev) => [...prev, existing.id]);
                            setTagSearch('');
                          } else if (!existing) {
                            handleNewTag(tagSearch.trim());
                          }
                        }
                      }}
                    />
                    {tagSearch && filteredTags.length > 0 && (
                      <div className="absolute left-0 top-full z-20 mt-1 max-h-32 w-48 overflow-y-auto rounded-sm border border-border bg-surface py-1 shadow-lg">
                        {filteredTags.slice(0, 8).map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => { setTagIds((prev) => [...prev, t.id]); setTagSearch(''); }}
                            className="block w-full px-3 py-1.5 text-left font-sans text-[0.8125rem] text-text-primary hover:bg-offwhite-alt"
                          >
                            {t.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Hero Image */}
              <div className="mt-4">
                <label className="font-sans text-[0.8125rem] font-semibold text-text-muted">Hero Image</label>
                <div className="mt-1.5">
                  {heroImage ? (
                    <div className="relative aspect-video max-h-48 overflow-hidden rounded-sm border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={heroImage} alt={heroAlt || ''} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-navy-dark/40 opacity-0 transition-opacity hover:opacity-100">
                        <button type="button" onClick={() => setHeroImage('')} className="rounded-sm bg-surface px-3 py-1.5 font-sans text-[0.75rem] font-medium">Remove</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        ref={heroFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleHeroUpload(file);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => heroFileRef.current?.click()}
                        disabled={heroUploading}
                        className="w-full rounded-sm border border-dashed border-border bg-offwhite px-3 py-6 text-center font-sans text-[0.8125rem] text-text-muted transition-colors hover:border-copper hover:text-copper disabled:opacity-50"
                      >
                        {heroUploading ? 'Uploading...' : 'Click to upload an image'}
                      </button>
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-border" />
                        <span className="font-sans text-[0.6875rem] uppercase tracking-wider text-text-muted">or</span>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <input
                        value={heroImage}
                        onChange={(e) => setHeroImage(e.target.value)}
                        aria-label="Hero image URL"
                        className="w-full rounded-sm border border-border bg-offwhite px-3 py-2.5 font-sans text-[0.8125rem] text-text-primary placeholder:text-text-muted/50 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15"
                        placeholder="Enter image URL or path..."
                      />
                    </div>
                  )}
                </div>
                {heroImage && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <input value={heroAlt} onChange={(e) => setHeroAlt(e.target.value)} aria-label="Hero alt text" className="rounded-sm border border-border bg-offwhite px-3 py-2 font-sans text-[0.8125rem] focus:outline-none focus:ring-2 focus:ring-navy/15" placeholder="Alt text (required)" />
                    <input value={heroCredit} onChange={(e) => setHeroCredit(e.target.value)} aria-label="Hero credit" className="rounded-sm border border-border bg-offwhite px-3 py-2 font-sans text-[0.8125rem] focus:outline-none focus:ring-2 focus:ring-navy/15" placeholder="Credit (optional)" />
                  </div>
                )}
              </div>
            </div>

            {/* Article Body */}
            <div className="rounded-sm border border-border/70 bg-surface px-6 py-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-sans text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-text-muted">Article Body</p>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileImport(file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-sm bg-copper px-3 py-1.5 font-sans text-[0.8125rem] font-semibold text-white transition-colors hover:bg-copper-dark"
                  >
                    <UploadIcon className="h-3.5 w-3.5" /> Import Article
                  </button>
                  <button type="button" onClick={() => setMdModalOpen(true)} className="rounded-sm border border-border px-3 py-1.5 font-sans text-[0.8125rem] font-medium text-navy transition-colors hover:bg-offwhite-alt">
                    Paste Markdown
                  </button>
                  <div ref={addBlockRef} className="relative">
                    <button type="button" onClick={() => setAddBlockOpen((v) => !v)} className="flex items-center gap-1 rounded-sm border border-border px-3 py-1.5 font-sans text-[0.8125rem] font-medium text-text-muted transition-colors hover:text-text-primary">
                      <PlusIcon className="h-3.5 w-3.5" /> Add Block
                    </button>
                    {addBlockOpen && (
                      <div role="menu" className="absolute right-0 top-full z-20 mt-1 w-48 rounded-sm border border-border bg-surface py-1 shadow-lg">
                        {BLOCK_TYPES.map((bt) => {
                          const BIcon = bt.icon;
                          return (
                            <button
                              key={bt.type + (bt.label.includes('Warning') ? '-w' : '')}
                              type="button"
                              role="menuitem"
                              onClick={() => addBlock(bt.type === 'callout' && bt.label.includes('Warning') ? 'callout-warning' : bt.type)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left font-sans text-[0.8125rem] text-text-primary hover:bg-offwhite-alt"
                            >
                              <BIcon className="h-3.5 w-3.5 text-text-muted" /> {bt.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {body.length === 0 ? (
                <div className="py-12 text-center">
                  <FileTextIcon className="mx-auto mb-3 h-10 w-10 text-text-muted/30" />
                  <p className="font-sans text-[0.875rem] text-text-muted">No content blocks yet. Paste markdown or add blocks manually.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {body.map((block, i) => (
                    <BlockItem
                      key={i}
                      block={block}
                      index={i}
                      expanded={expandedBlocks[i] || false}
                      onToggle={() => toggleBlock(i)}
                      onChange={(b) => updateBlock(i, b)}
                      onDelete={() => deleteBlock(i)}
                    />
                  ))}
                </div>
              )}
              {body.length > 0 && (
                <p className="mt-3 font-sans text-[0.75rem] text-text-muted">
                  {wordCount.toLocaleString()} words · {readTime} min read · {body.length} blocks
                </p>
              )}
            </div>

            {/* Key Takeaways */}
            <div className="rounded-sm border border-border/70 bg-surface px-6 py-5">
              <p className="mb-3 font-sans text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-text-muted">Key Takeaways</p>
              <div className="space-y-2">
                {keyTakeaways.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="font-sans text-[0.75rem] text-text-muted">{i + 1}.</span>
                    <input
                      value={item}
                      onChange={(e) => setKeyTakeaways((prev) => prev.map((v, idx) => idx === i ? e.target.value : v))}
                      className="flex-1 rounded-sm border border-border bg-offwhite px-3 py-2 font-sans text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-navy/15"
                      placeholder={i === 0 ? "What's the most important thing readers should remember?" : 'Takeaway...'}
                    />
                    <button type="button" onClick={() => setKeyTakeaways((prev) => prev.filter((_, idx) => idx !== i))} className="p-1 text-text-muted/40 hover:text-danger">
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setKeyTakeaways((prev) => [...prev, ''])} className="mt-3 flex items-center gap-1 font-sans text-[0.8125rem] font-medium text-copper hover:text-copper-dark">
                <PlusIcon className="h-3 w-3" /> Add takeaway
              </button>
            </div>

            {/* FAQs */}
            <div className="rounded-sm border border-border/70 bg-surface px-6 py-5">
              <p className="mb-3 font-sans text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-text-muted">FAQs</p>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div key={i} className="rounded-sm border border-border/60 p-3">
                    <input
                      value={faq.question}
                      onChange={(e) => setFaqs((prev) => prev.map((f, idx) => idx === i ? { ...f, question: e.target.value } : f))}
                      className="w-full rounded-sm border border-border bg-offwhite px-3 py-2 font-sans text-[0.875rem] font-medium focus:outline-none focus:ring-2 focus:ring-navy/15"
                      placeholder="Question..."
                    />
                    <textarea
                      value={faq.answer}
                      onChange={(e) => setFaqs((prev) => prev.map((f, idx) => idx === i ? { ...f, answer: e.target.value } : f))}
                      rows={2}
                      className="mt-2 w-full rounded-sm border border-border bg-offwhite px-3 py-2 font-sans text-[0.8125rem] leading-relaxed focus:outline-none focus:ring-2 focus:ring-navy/15"
                      placeholder="Answer..."
                    />
                    <button type="button" onClick={() => setFaqs((prev) => prev.filter((_, idx) => idx !== i))} className="mt-1 font-sans text-[0.75rem] text-text-muted hover:text-danger">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setFaqs((prev) => [...prev, { question: '', answer: '' }])} className="mt-3 flex items-center gap-1 font-sans text-[0.8125rem] font-medium text-copper hover:text-copper-dark">
                <PlusIcon className="h-3 w-3" /> Add FAQ
              </button>
            </div>

            {/* Related Posts */}
            <div className="rounded-sm border border-border/70 bg-surface px-6 py-5">
              <p className="mb-3 font-sans text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-text-muted">Related Posts</p>
              <Select
                value=""
                onChange={(e) => {
                  if (e.target.value && !relatedPostIds.includes(e.target.value) && relatedPostIds.length < 3) {
                    setRelatedPostIds((prev) => [...prev, e.target.value]);
                  }
                }}
                className="!text-[0.875rem]"
              >
                <option value="">Select a related post...</option>
                {allPosts.filter((p) => !relatedPostIds.includes(p.id)).map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </Select>
              {relatedPostIds.length > 0 && (
                <div className="mt-3 space-y-2">
                  {relatedPostIds.map((id) => {
                    const p = allPosts.find((a) => a.id === id);
                    return (
                      <div key={id} className="flex items-center justify-between rounded-sm border border-border/60 px-3 py-2">
                        <span className="font-sans text-[0.8125rem] text-text-primary">{p?.title || id}</span>
                        <button type="button" onClick={() => setRelatedPostIds((prev) => prev.filter((r) => r !== id))} className="text-text-muted hover:text-danger">
                          <XIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footnotes */}
            <div className="rounded-sm border border-border/70 bg-surface px-6 py-5">
              <p className="mb-3 font-sans text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-text-muted">Footnotes</p>
              <div className="space-y-2">
                {footnotes.map((fn, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="font-sans text-[0.75rem] text-text-muted">{i + 1}.</span>
                    <input
                      value={fn}
                      onChange={(e) => setFootnotes((prev) => prev.map((v, idx) => idx === i ? e.target.value : v))}
                      className="flex-1 rounded-sm border border-border bg-offwhite px-3 py-2 font-sans text-[0.8125rem] focus:outline-none focus:ring-2 focus:ring-navy/15"
                      placeholder="Footnote text..."
                    />
                    <button type="button" onClick={() => setFootnotes((prev) => prev.filter((_, idx) => idx !== i))} className="p-1 text-text-muted/40 hover:text-danger">
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setFootnotes((prev) => [...prev, ''])} className="mt-3 flex items-center gap-1 font-sans text-[0.8125rem] font-medium text-copper hover:text-copper-dark">
                <PlusIcon className="h-3 w-3" /> Add footnote
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN - Sidebar */}
          <div className="space-y-4 xl:sticky xl:top-[calc(5rem+56px)] xl:self-start">
            {/* Publish */}
            <div className="rounded-sm border border-border/70 bg-surface px-5 py-4">
              <p className="font-serif text-[1rem] font-semibold text-text-primary">Publish</p>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="font-sans text-[0.8125rem] font-semibold text-text-muted">Visibility</label>
                  <div className="mt-1 flex rounded-sm border border-border">
                    {['public', 'unlisted'].map((v) => (
                      <button key={v} type="button" onClick={() => setVisibility(v)} className={cn('flex-1 px-3 py-1.5 font-sans text-[0.8125rem] capitalize transition-colors', visibility === v ? 'bg-navy text-white' : 'text-text-muted hover:text-text-primary')}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <FormField label="Publish Date" type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} />
                <FormField label="Author" value={author} onChange={(e) => setAuthor(e.target.value)} />
              </div>
              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={() => handleSave('draft')}
                  disabled={saving}
                  className="w-full rounded-sm border border-border px-4 py-2.5 font-sans text-[0.875rem] font-medium text-text-primary transition-colors hover:bg-offwhite-alt disabled:opacity-50"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(isScheduled ? 'scheduled' : 'published')}
                  disabled={saving}
                  className="w-full rounded-sm bg-copper px-4 py-2.5 font-sans text-[0.875rem] font-semibold text-white transition-colors hover:bg-copper-dark disabled:opacity-50"
                >
                  {publishLabel}
                </button>
                {isEditing && status === 'published' && (
                  <button type="button" onClick={() => handleSave('draft', false, 'Post unpublished.')} className="w-full py-1 font-sans text-[0.8125rem] text-danger hover:underline">
                    Unpublish
                  </button>
                )}
              </div>
            </div>

            {/* SEO */}
            <CollapsiblePanel title="SEO" badge={`${seo.passed}/${seo.total} complete`}>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-sans text-[0.8125rem] font-semibold text-text-muted">Meta Title</label>
                    <span className={cn('font-sans text-[0.6875rem]', (metaTitle || title).length > 60 ? 'text-danger' : 'text-text-muted')}>
                      {(metaTitle || title).length}/60
                    </span>
                  </div>
                  <input
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="mt-1 w-full rounded-sm border border-border bg-offwhite px-3 py-2 font-sans text-[0.8125rem] focus:outline-none focus:ring-2 focus:ring-navy/15"
                    placeholder={title || 'Auto-generated from title'}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-sans text-[0.8125rem] font-semibold text-text-muted">Meta Description</label>
                    <span className={cn('font-sans text-[0.6875rem]', (metaDescription || excerpt).length > 160 ? 'text-danger' : 'text-text-muted')}>
                      {(metaDescription || excerpt).length}/160
                    </span>
                  </div>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded-sm border border-border bg-offwhite px-3 py-2 font-sans text-[0.8125rem] leading-relaxed focus:outline-none focus:ring-2 focus:ring-navy/15"
                    placeholder={excerpt || 'Auto-generated from excerpt'}
                  />
                </div>
                <div>
                  <label className="font-sans text-[0.8125rem] font-semibold text-text-muted">URL Slug</label>
                  <div className="mt-1 flex items-center rounded-sm border border-border bg-offwhite">
                    <span className="px-3 font-sans text-[0.75rem] text-text-muted">/{getPublicTypeSegment(type)}/</span>
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                      className="flex-1 border-0 bg-transparent px-1 py-2 font-sans text-[0.8125rem] focus:outline-none"
                    />
                  </div>
                </div>
                <FormField label="Canonical URL" value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} placeholder="Leave empty to use default" />
                <GooglePreview title={metaTitle || title} slug={slug} description={metaDescription || excerpt} type={type} />
                <SEOChecklist post={{ title, slug, excerpt, metaTitle, metaDescription, heroImage, heroAlt, body }} />
              </div>
            </CollapsiblePanel>

            {/* Schema */}
            <CollapsiblePanel title="Structured Data" defaultOpen={false}>
              <Select value={schemaType} onChange={(e) => setSchemaType(e.target.value)} className="!text-[0.8125rem]">
                <option value="Article">Article</option>
                <option value="HowTo">HowTo</option>
                <option value="FAQ">FAQ</option>
                <option value="Guide">Guide</option>
              </Select>
              <pre className="mt-3 max-h-48 overflow-auto rounded-sm bg-navy-dark p-3 font-mono text-[0.6875rem] leading-relaxed text-text-on-dark">
                {JSON.stringify({ '@type': schemaType, headline: title, description: excerpt }, null, 2)}
              </pre>
            </CollapsiblePanel>

            {/* Settings */}
            <CollapsiblePanel title="Settings" defaultOpen={false}>
              <div className="space-y-3">
                <FormField label="Read Time Override" value={readTimeOverride} onChange={(e) => setReadTimeOverride(e.target.value)} placeholder="Auto-calculated" helper={`Calculated: ${readTime} min`} />
                <label className="flex items-center gap-2 font-sans text-[0.8125rem] text-text-primary">
                  <input type="checkbox" checked={disableComments} onChange={(e) => setDisableComments(e.target.checked)} className="rounded-sm" />
                  Disable comments
                </label>
                <label className="flex items-center gap-2 font-sans text-[0.8125rem] text-text-primary">
                  <input type="checkbox" checked={noindex} onChange={(e) => setNoindex(e.target.checked)} className="rounded-sm" />
                  Noindex (prevent search engine indexing)
                </label>
              </div>
            </CollapsiblePanel>
          </div>
        </div>
      </div>

      <MarkdownModal
        open={mdModalOpen}
        onClose={() => setMdModalOpen(false)}
        onImport={(blocks) => {
          setBody((prev) => [...prev, ...blocks]);
          setMdModalOpen(false);
          toast({ title: `${blocks.length} blocks imported` });
        }}
      />
    </>
  );
}
