'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PortalPageHeader } from '../PortalShell';
import { useToast } from '../Toast';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createTag,
  deleteTag,
} from '@/app/actions/content';
import {
  PlusIcon,
  TrashIcon,
  XIcon,
  GripVerticalIcon,
  TagIcon,
} from '../icons';
import { cn } from '@/utils/cn';

const COLOR_OPTIONS = [
  { value: 'navy', bg: 'bg-navy', label: 'Navy' },
  { value: 'copper', bg: 'bg-copper', label: 'Copper' },
  { value: 'sage', bg: 'bg-sage', label: 'Sage' },
  { value: 'muted', bg: 'bg-text-muted', label: 'Gray' },
  { value: 'accent', bg: 'bg-accent', label: 'Red' },
];

function CategoryRow({ category, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.color);

  const save = () => {
    if (name.trim() && (name !== category.name || color !== category.color)) {
      onUpdate(category.id, { name: name.trim(), color });
    }
    setEditing(false);
  };

  return (
    <div className="group flex items-center gap-3 rounded-sm border border-border/60 bg-surface px-4 py-3 transition-colors hover:border-border">
      <GripVerticalIcon className="h-4 w-4 flex-shrink-0 cursor-grab text-text-muted/30" />

      {editing ? (
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setName(category.name); setEditing(false); } }}
          className="flex-1 rounded-sm border border-border bg-offwhite px-2 py-1 font-sans text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-navy/15"
          autoFocus
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex-1 text-left font-sans text-[0.9375rem] font-medium text-text-primary hover:text-navy"
        >
          {category.name}
        </button>
      )}

      <div className="flex items-center gap-1.5">
        {COLOR_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              setColor(opt.value);
              onUpdate(category.id, { color: opt.value });
            }}
            className={cn(
              'h-5 w-5 rounded-full transition-all',
              opt.bg,
              color === opt.value ? 'ring-2 ring-offset-2 ring-navy/30 scale-110' : 'opacity-50 hover:opacity-100'
            )}
            aria-label={opt.label}
          />
        ))}
      </div>

      <span className="rounded-full bg-offwhite-alt px-2.5 py-0.5 font-sans text-[0.6875rem] font-semibold text-text-muted">
        {category.postCount}
      </span>

      <button
        type="button"
        onClick={() => onDelete(category.id)}
        className="rounded-sm p-1 text-text-muted/30 opacity-0 transition-all group-hover:opacity-100 focus-visible:opacity-100 hover:text-danger"
        aria-label="Delete category"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ContentCategories({ categories: initialCategories, tags: initialTags }) {
  const router = useRouter();
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const [categories, setCategories] = useState(initialCategories);
  const [tags, setTags] = useState(initialTags);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    startTransition(async () => {
      const result = await createCategory({
        name: newCatName.trim(),
        postType: newCatType || null,
      });
      if (result.ok) {
        setCategories((prev) => [...prev, { ...result.category, postCount: 0 }]);
        setNewCatName('');
        setNewCatType('');
        toast({ title: 'Category created' });
      } else {
        toast({ title: 'Failed to create category', description: result.error, variant: 'error' });
      }
    });
  };

  const handleUpdateCategory = (id, data) => {
    startTransition(async () => {
      const result = await updateCategory(id, data);
      if (result.ok) {
        setCategories((prev) => prev.map((c) => c.id === id ? { ...c, ...data } : c));
      }
    });
  };

  const handleDeleteCategory = (id) => {
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (result.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        toast({ title: 'Category deleted' });
      } else {
        toast({ title: 'Failed to delete', description: result.error, variant: 'error' });
      }
    });
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    startTransition(async () => {
      const result = await createTag({ name: newTagName.trim() });
      if (result.ok) {
        setTags((prev) => [...prev, { ...result.tag, postCount: 0 }]);
        setNewTagName('');
        toast({ title: 'Tag created' });
      } else {
        toast({ title: 'Failed to create tag', description: result.error, variant: 'error' });
      }
    });
  };

  const handleDeleteTag = (id) => {
    const tag = tags.find((t) => t.id === id);
    const msg = tag?.postCount > 0
      ? `This tag is used on ${tag.postCount} post${tag.postCount === 1 ? '' : 's'}. Delete it anyway?`
      : `Delete tag "${tag?.name ?? ''}"?`;
    if (!window.confirm(msg)) return;

    startTransition(async () => {
      const result = await deleteTag(id);
      if (result.ok) {
        setTags((prev) => prev.filter((t) => t.id !== id));
        toast({ title: 'Tag deleted' });
      } else {
        toast({ title: 'Failed to delete', description: result.error, variant: 'error' });
      }
    });
  };

  const filteredTags = tagFilter
    ? tags.filter((t) => t.name.toLowerCase().includes(tagFilter.toLowerCase()))
    : tags;

  return (
    <>
      <PortalPageHeader
        title="Categories & Tags"
        breadcrumbs={[
          { label: 'Content', href: '/admin/content' },
          { label: 'Categories & Tags' },
        ]}
      />

      <div className="px-6 py-6 lg:px-10 lg:py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Categories */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-[1.25rem] font-semibold text-text-primary">Categories</h2>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); }}
                aria-label="New category name"
                className="flex-1 rounded-sm border border-border bg-surface px-3.5 py-2.5 font-sans text-[0.875rem] text-text-primary placeholder:text-text-muted/60 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15"
                placeholder="New category name..."
              />
              <select
                value={newCatType}
                onChange={(e) => setNewCatType(e.target.value)}
                aria-label="Category post type"
                className="rounded-sm border border-border bg-surface px-3 py-2.5 font-sans text-[0.875rem] text-text-primary focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15"
              >
                <option value="">Both</option>
                <option value="blog">Blog</option>
                <option value="guide">Guide</option>
              </select>
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={!newCatName.trim()}
                className="inline-flex items-center gap-1.5 rounded-sm bg-copper px-4 py-2.5 font-sans text-[0.8125rem] font-semibold text-white transition-colors hover:bg-copper-dark disabled:opacity-50"
              >
                <PlusIcon className="h-4 w-4" /> Add
              </button>
            </div>

            <div className="space-y-2">
              {categories.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  onUpdate={handleUpdateCategory}
                  onDelete={handleDeleteCategory}
                />
              ))}
              {categories.length === 0 && (
                <p className="py-8 text-center font-sans text-[0.875rem] text-text-muted">
                  No categories yet. Create one above.
                </p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-[1.25rem] font-semibold text-text-primary">Tags</h2>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(); }}
                aria-label="New tag name"
                className="flex-1 rounded-sm border border-border bg-surface px-3.5 py-2.5 font-sans text-[0.875rem] text-text-primary placeholder:text-text-muted/60 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15"
                placeholder="New tag name..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!newTagName.trim()}
                className="inline-flex items-center gap-1.5 rounded-sm bg-copper px-4 py-2.5 font-sans text-[0.8125rem] font-semibold text-white transition-colors hover:bg-copper-dark disabled:opacity-50"
              >
                <PlusIcon className="h-4 w-4" /> Add
              </button>
            </div>

            <div className="mb-3">
              <input
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                aria-label="Filter tags"
                className="w-full rounded-sm border border-border bg-surface px-3 py-2 font-sans text-[0.8125rem] text-text-primary placeholder:text-text-muted/50 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15"
                placeholder="Filter tags..."
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {filteredTags.map((tag) => (
                <span
                  key={tag.id}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 font-sans text-[0.8125rem] font-medium text-text-primary transition-colors hover:border-copper"
                >
                  <TagIcon className="h-3 w-3 text-text-muted" />
                  {tag.name}
                  <span className="font-sans text-[0.6875rem] text-text-muted">{tag.postCount}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteTag(tag.id)}
                    className="ml-0.5 rounded-full p-0.5 text-text-muted/40 transition-colors hover:text-danger"
                    aria-label={`Delete tag ${tag.name}`}
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {filteredTags.length === 0 && (
                <p className="py-8 text-center font-sans text-[0.875rem] text-text-muted w-full">
                  {tagFilter ? 'No matching tags.' : 'No tags yet. Create one above.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
