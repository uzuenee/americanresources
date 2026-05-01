'use client';

import { useCallback } from 'react';
import Image from 'next/image';
import { slugify } from '@/lib/article-utils';
import { PullQuote } from './PullQuote';
import { Callout } from './Callout';
import { InlineImage } from './InlineImage';
import { cn } from '@/utils/cn';

function HeadingAnchor({ id, level, children }) {
  const Tag = `h${level}`;

  const handleCopy = useCallback((e) => {
    e.preventDefault();
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);
    const btn = e.currentTarget;
    btn.dataset.copied = 'true';
    setTimeout(() => { btn.dataset.copied = ''; }, 1600);
  }, [id]);

  const headingClass = cn(
    'group relative',
    level === 2 && 'font-[family-name:var(--font-display)] text-[clamp(1.5rem,3vw,2rem)] font-semibold leading-[1.25] text-text-primary',
    level === 3 && 'mt-10 mb-4 font-[family-name:var(--font-display)] text-[clamp(1.125rem,2vw,1.375rem)] font-semibold leading-[1.3] text-text-primary',
    level === 4 && 'mt-8 mb-3 font-sans text-[1.0625rem] font-semibold text-text-primary'
  );

  return (
    <>
      {level === 2 && (
        <div className="mb-4 mt-14" aria-hidden="true">
          <div className="article-heading-rule" />
        </div>
      )}
      <Tag id={id} className={headingClass} style={{ scrollMarginTop: 'calc(5rem + 56px + 24px)' }}>
        <a
          href={`#${id}`}
          onClick={handleCopy}
          className={cn(
            'absolute opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper',
            level === 2 ? '-left-8 top-1 text-[0.7em] text-copper' : '-left-6 top-0.5 text-[0.65em] text-copper'
          )}
          aria-label={`Link to section: ${typeof children === 'string' ? children : ''}`}
        >
          #
        </a>
        {children}
      </Tag>
    </>
  );
}

function RichText({ content, className }) {
  const processed = content.replace(
    /\{\{fn:(\d+)\}\}/g,
    '<sup><button id="fnref-$1" class="fn-ref cursor-pointer font-sans text-[0.7em] font-semibold text-copper transition-colors hover:text-copper-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper" data-fn="$1" aria-label="Footnote $1">$1</button></sup>'
  );
  return (
    <span className={className} dangerouslySetInnerHTML={{ __html: processed }} />
  );
}

function BlockRenderer({ block, index, isFirst }) {
  switch (block.type) {
    case 'p':
      return (
        <p className={cn(
          'mt-7 max-w-[42em] font-[family-name:var(--font-reading)] text-[1.125rem] leading-[1.8] tracking-[-0.01em] text-text-primary',
          isFirst && 'article-drop-cap'
        )}>
          <RichText content={block.content} />
        </p>
      );

    case 'h2':
      return (
        <HeadingAnchor id={slugify(block.content)} level={2}>
          {block.content}
        </HeadingAnchor>
      );

    case 'h3':
      return (
        <HeadingAnchor id={slugify(block.content)} level={3}>
          {block.content}
        </HeadingAnchor>
      );

    case 'h4':
      return (
        <HeadingAnchor id={slugify(block.content)} level={4}>
          {block.content}
        </HeadingAnchor>
      );

    case 'pullquote':
      return (
        <PullQuote attribution={block.attribution}>
          {block.content}
        </PullQuote>
      );

    case 'callout':
      return (
        <Callout variant={block.variant}>
          <RichText content={block.content} />
        </Callout>
      );

    case 'image':
      return (
        <InlineImage
          src={block.src}
          alt={block.alt}
          variant={block.variant}
          caption={block.caption}
          credit={block.credit}
        />
      );

    case 'blockquote':
      return (
        <blockquote className="my-10 border-l-[3px] border-copper bg-copper/[0.04] py-5 pl-6 pr-6">
          <p className="font-[family-name:var(--font-display)] text-[clamp(1.25rem,2.5vw,1.625rem)] italic leading-[1.5] text-text-primary">
            <RichText content={block.content} />
          </p>
        </blockquote>
      );

    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul';
      return (
        <Tag className={cn(
          'my-6 max-w-[42em] space-y-2 pl-6',
          block.ordered ? 'article-ol' : 'article-ul'
        )}>
          {block.items.map((item, i) => (
            <li key={i} className="font-[family-name:var(--font-reading)] text-[1.125rem] leading-relaxed text-text-primary">
              <RichText content={item} />
            </li>
          ))}
        </Tag>
      );
    }

    case 'hr':
      return (
        <div className="my-14 flex justify-center" aria-hidden="true">
          <hr className="article-hr w-full max-w-xs" />
        </div>
      );

    case 'table':
      return (
        <div className="my-8 w-full overflow-x-auto">
          <table className="w-full border-collapse">
            {block.headers && (
              <thead>
                <tr className="bg-offwhite-alt">
                  {block.headers.map((h, i) => (
                    <th key={i} className="border-b border-b-copper px-4 py-3.5 text-left font-sans text-sm font-semibold uppercase tracking-[0.06em] text-text-primary">{h}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border-b border-b-border px-4 py-3.5 font-[family-name:var(--font-reading)] text-[0.9375rem] leading-normal">
                      <RichText content={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'code':
      return (
        <pre className="my-8 overflow-x-auto rounded-sm border border-navy-light/20 bg-navy-dark px-7 py-6">
          <code className="font-mono text-sm leading-relaxed text-text-on-dark">{block.content}</code>
        </pre>
      );

    default:
      return null;
  }
}

export function ArticleBody({ blocks }) {
  const handleBodyClick = useCallback((e) => {
    const btn = e.target.closest('.fn-ref');
    if (!btn) return;
    const fnId = btn.dataset.fn;
    const target = document.getElementById(`fn-${fnId}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      target.style.transition = 'none';
      target.style.backgroundColor = 'var(--color-copper-light)';
      setTimeout(() => {
        target.style.transition = 'background-color 0.8s ease-out';
        target.style.backgroundColor = 'transparent';
      }, 1200);
    }
  }, []);

  if (!blocks || blocks.length === 0) return null;

  const firstPIndex = blocks.findIndex((b) => b.type === 'p');

  return (
    <div className="article-body" onClick={handleBodyClick}>
      {blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} index={i} isFirst={i === firstPIndex} />
      ))}
    </div>
  );
}
