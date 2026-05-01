/**
 * Markdown → structured block parser.
 * Converts pasted markdown into the block format used by the CMS and article renderer.
 */

export function parseMarkdown(md) {
  if (!md || !md.trim()) return [];

  const lines = md.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const type = level === 1 ? 'h2' : `h${Math.min(level, 4)}`;
      blocks.push({ type, content: headingMatch[2].trim() });
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(trimmed)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // Callout blocks (:::tip, :::warning, :::note, :::compliance)
    const calloutMatch = trimmed.match(/^:::(tip|warning|note|compliance)\s*$/i);
    if (calloutMatch) {
      const variant = calloutMatch[1].toLowerCase();
      const contentLines = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ':::') {
        contentLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing :::
      blocks.push({
        type: 'callout',
        variant,
        content: contentLines.join('\n').trim(),
      });
      continue;
    }

    // Blockquote / pull quote
    if (trimmed.startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      const quoteText = quoteLines.join(' ').trim();

      // Check for attribution (line starting with -- or —)
      const attrMatch = quoteText.match(/^(.+?)(?:\s*[-—]{1,2}\s*(.+))$/);
      if (attrMatch && attrMatch[2]) {
        blocks.push({
          type: 'pullquote',
          content: attrMatch[1].trim(),
          attribution: attrMatch[2].trim(),
        });
      } else {
        blocks.push({ type: 'pullquote', content: quoteText });
      }
      continue;
    }

    // Image
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)(.*)$/);
    if (imgMatch) {
      blocks.push({
        type: 'image',
        alt: imgMatch[1],
        src: imgMatch[2],
        caption: imgMatch[3]?.trim() || '',
        variant: 'column',
      });
      i++;
      continue;
    }

    // Unordered list
    if (/^[-*+]\s/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*+]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'list', ordered: false, items });
      continue;
    }

    // Ordered list
    if (/^\d+[.)]\s/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+[.)]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'list', ordered: true, items });
      continue;
    }

    // Code block
    if (trimmed.startsWith('```')) {
      const contentLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        contentLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing ```
      blocks.push({ type: 'code', content: contentLines.join('\n') });
      continue;
    }

    // Default: paragraph (collect consecutive non-empty lines)
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('>') &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith(':::') &&
      !/^[-*+]\s/.test(lines[i].trim()) &&
      !/^\d+[.)]\s/.test(lines[i].trim()) &&
      !/^(-{3,}|_{3,}|\*{3,})$/.test(lines[i].trim()) &&
      !/^!\[/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }

    if (paraLines.length > 0) {
      blocks.push({ type: 'p', content: paraLines.join(' ') });
    }
  }

  return blocks;
}
