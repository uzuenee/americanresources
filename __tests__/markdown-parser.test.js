import { describe, it, expect } from 'vitest';
import { parseMarkdown } from '@/lib/markdown-parser';

describe('parseMarkdown', () => {
  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------
  it('returns empty array for null/undefined/empty input', () => {
    expect(parseMarkdown(null)).toEqual([]);
    expect(parseMarkdown(undefined)).toEqual([]);
    expect(parseMarkdown('')).toEqual([]);
    expect(parseMarkdown('   ')).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Headings
  // -------------------------------------------------------------------------
  describe('headings', () => {
    it('parses # as h2 (offset by 1)', () => {
      const blocks = parseMarkdown('# Main Title');
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toEqual({ type: 'h2', content: 'Main Title' });
    });

    it('parses ## as h2', () => {
      const blocks = parseMarkdown('## Section Heading');
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toEqual({ type: 'h2', content: 'Section Heading' });
    });

    it('parses ### as h3', () => {
      const blocks = parseMarkdown('### Sub Section');
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toEqual({ type: 'h3', content: 'Sub Section' });
    });

    it('parses #### as h4', () => {
      const blocks = parseMarkdown('#### Deep Heading');
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toEqual({ type: 'h4', content: 'Deep Heading' });
    });

    it('trims heading content', () => {
      const blocks = parseMarkdown('##   Spaced Heading   ');
      expect(blocks[0].content).toBe('Spaced Heading');
    });
  });

  // -------------------------------------------------------------------------
  // Horizontal rules
  // -------------------------------------------------------------------------
  describe('horizontal rules', () => {
    it('parses --- as hr', () => {
      expect(parseMarkdown('---')[0]).toEqual({ type: 'hr' });
    });

    it('parses ___ as hr', () => {
      expect(parseMarkdown('___')[0]).toEqual({ type: 'hr' });
    });

    it('parses *** as hr', () => {
      expect(parseMarkdown('***')[0]).toEqual({ type: 'hr' });
    });

    it('parses longer rules like -----', () => {
      expect(parseMarkdown('-----')[0]).toEqual({ type: 'hr' });
    });
  });

  // -------------------------------------------------------------------------
  // Paragraphs
  // -------------------------------------------------------------------------
  describe('paragraphs', () => {
    it('wraps plain text in a paragraph block', () => {
      const blocks = parseMarkdown('Hello world.');
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toEqual({ type: 'p', content: 'Hello world.' });
    });

    it('joins consecutive non-empty lines into one paragraph', () => {
      const blocks = parseMarkdown('Line one\nLine two\nLine three');
      expect(blocks).toHaveLength(1);
      expect(blocks[0].content).toBe('Line one Line two Line three');
    });

    it('splits paragraphs on blank lines', () => {
      const blocks = parseMarkdown('Para one.\n\nPara two.');
      expect(blocks).toHaveLength(2);
      expect(blocks[0].content).toBe('Para one.');
      expect(blocks[1].content).toBe('Para two.');
    });
  });

  // -------------------------------------------------------------------------
  // Callouts
  // -------------------------------------------------------------------------
  describe('callouts', () => {
    it('parses :::tip callout blocks', () => {
      const md = ':::tip\nThis is a tip.\n:::';
      const blocks = parseMarkdown(md);
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toEqual({
        type: 'callout',
        variant: 'tip',
        content: 'This is a tip.',
      });
    });

    it('parses :::warning callout blocks', () => {
      const md = ':::warning\nBe careful here.\n:::';
      const blocks = parseMarkdown(md);
      expect(blocks[0].variant).toBe('warning');
    });

    it('parses :::note callout blocks', () => {
      const md = ':::note\nA note.\n:::';
      expect(parseMarkdown(md)[0].variant).toBe('note');
    });

    it('parses :::compliance callout blocks', () => {
      const md = ':::compliance\nRegulatory requirement.\n:::';
      expect(parseMarkdown(md)[0].variant).toBe('compliance');
    });

    it('handles multi-line callouts', () => {
      const md = ':::tip\nLine one.\nLine two.\nLine three.\n:::';
      const blocks = parseMarkdown(md);
      expect(blocks[0].content).toBe('Line one.\nLine two.\nLine three.');
    });

    it('is case-insensitive for variant names', () => {
      const md = ':::TIP\nSome tip.\n:::';
      expect(parseMarkdown(md)[0].variant).toBe('tip');
    });
  });

  // -------------------------------------------------------------------------
  // Blockquotes / Pull quotes
  // -------------------------------------------------------------------------
  describe('blockquotes / pull quotes', () => {
    it('parses > lines as pullquote', () => {
      const blocks = parseMarkdown('> This is a quote.');
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('pullquote');
      expect(blocks[0].content).toBe('This is a quote.');
    });

    it('joins multi-line blockquotes', () => {
      const md = '> Line one\n> Line two';
      const blocks = parseMarkdown(md);
      expect(blocks[0].content).toBe('Line one Line two');
    });

    it('extracts attribution with -- separator', () => {
      const md = '> Something profound -- John Doe';
      const blocks = parseMarkdown(md);
      expect(blocks[0].content).toBe('Something profound');
      expect(blocks[0].attribution).toBe('John Doe');
    });

    it('extracts attribution with em dash', () => {
      const md = '> A great saying — Jane Smith';
      const blocks = parseMarkdown(md);
      expect(blocks[0].attribution).toBe('Jane Smith');
    });
  });

  // -------------------------------------------------------------------------
  // Images
  // -------------------------------------------------------------------------
  describe('images', () => {
    it('parses markdown images', () => {
      const md = '![Alt text](/images/photo.jpg)';
      const blocks = parseMarkdown(md);
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toEqual({
        type: 'image',
        alt: 'Alt text',
        src: '/images/photo.jpg',
        caption: '',
        variant: 'column',
      });
    });

    it('extracts caption after closing paren', () => {
      const md = '![Alt](/img.jpg) Photo caption here';
      const blocks = parseMarkdown(md);
      expect(blocks[0].caption).toBe('Photo caption here');
    });

    it('handles empty alt text', () => {
      const md = '![](/img.jpg)';
      expect(parseMarkdown(md)[0].alt).toBe('');
    });
  });

  // -------------------------------------------------------------------------
  // Lists
  // -------------------------------------------------------------------------
  describe('unordered lists', () => {
    it('parses - prefixed items', () => {
      const md = '- Item one\n- Item two\n- Item three';
      const blocks = parseMarkdown(md);
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('list');
      expect(blocks[0].ordered).toBe(false);
      expect(blocks[0].items).toEqual(['Item one', 'Item two', 'Item three']);
    });

    it('parses * prefixed items', () => {
      const md = '* Alpha\n* Beta';
      const blocks = parseMarkdown(md);
      expect(blocks[0].ordered).toBe(false);
      expect(blocks[0].items).toEqual(['Alpha', 'Beta']);
    });

    it('parses + prefixed items', () => {
      const md = '+ First\n+ Second';
      expect(parseMarkdown(md)[0].items).toEqual(['First', 'Second']);
    });
  });

  describe('ordered lists', () => {
    it('parses numbered items with dot', () => {
      const md = '1. First\n2. Second\n3. Third';
      const blocks = parseMarkdown(md);
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('list');
      expect(blocks[0].ordered).toBe(true);
      expect(blocks[0].items).toEqual(['First', 'Second', 'Third']);
    });

    it('parses numbered items with parenthesis', () => {
      const md = '1) Alpha\n2) Beta';
      const blocks = parseMarkdown(md);
      expect(blocks[0].ordered).toBe(true);
      expect(blocks[0].items).toEqual(['Alpha', 'Beta']);
    });
  });

  // -------------------------------------------------------------------------
  // Code blocks
  // -------------------------------------------------------------------------
  describe('code blocks', () => {
    it('parses fenced code blocks', () => {
      const md = '```\nconst x = 1;\nconsole.log(x);\n```';
      const blocks = parseMarkdown(md);
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('code');
      expect(blocks[0].content).toBe('const x = 1;\nconsole.log(x);');
    });

    it('preserves whitespace inside code blocks', () => {
      const md = '```\n  indented\n    double\n```';
      expect(parseMarkdown(md)[0].content).toBe('  indented\n    double');
    });

    it('ignores language hints on opening fence', () => {
      const md = '```javascript\nlet a = 1;\n```';
      const blocks = parseMarkdown(md);
      expect(blocks[0].type).toBe('code');
    });
  });

  // -------------------------------------------------------------------------
  // Mixed content
  // -------------------------------------------------------------------------
  describe('mixed content', () => {
    it('parses a full document with multiple block types', () => {
      const md = [
        '## Introduction',
        '',
        'This is the first paragraph.',
        '',
        '- Item A',
        '- Item B',
        '',
        '> A wise quote -- Someone',
        '',
        '---',
        '',
        '### Sub-section',
        '',
        '1. Step one',
        '2. Step two',
      ].join('\n');

      const blocks = parseMarkdown(md);
      expect(blocks.map((b) => b.type)).toEqual([
        'h2', 'p', 'list', 'pullquote', 'hr', 'h3', 'list',
      ]);
    });
  });
});
