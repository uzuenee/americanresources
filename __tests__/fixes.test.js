import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

function readFile(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf-8');
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

// ---------------------------------------------------------------------------
// Fix 1: Terms & Privacy pages exist and are linked
// ---------------------------------------------------------------------------
describe('Fix 1: Terms of Service and Privacy Policy', () => {
  it('terms page exists', () => {
    expect(fileExists('src/app/(marketing)/terms/page.js')).toBe(true);
  });

  it('privacy page exists', () => {
    expect(fileExists('src/app/(marketing)/privacy/page.js')).toBe(true);
  });

  it('terms page exports metadata with title', () => {
    const content = readFile('src/app/(marketing)/terms/page.js');
    expect(content).toContain("title: 'Terms of Service'");
  });

  it('privacy page exports metadata with title', () => {
    const content = readFile('src/app/(marketing)/privacy/page.js');
    expect(content).toContain("title: 'Privacy Policy'");
  });

  it('SignupForm links to /terms and /privacy (no href="#")', () => {
    const content = readFile('src/components/portal/SignupForm.jsx');
    expect(content).toContain('href="/terms"');
    expect(content).toContain('href="/privacy"');
    expect(content).not.toContain('href="#"');
  });
});

// ---------------------------------------------------------------------------
// Fix 2: Forbidden page uses valid theme colors
// ---------------------------------------------------------------------------
describe('Fix 2: Forbidden page color tokens', () => {
  it('does not use undefined bg-forest class', () => {
    const content = readFile('src/app/forbidden/page.js');
    expect(content).not.toContain('bg-forest');
  });

  it('uses bg-navy (a defined theme color)', () => {
    const content = readFile('src/app/forbidden/page.js');
    expect(content).toContain('bg-navy');
  });

  it('no file in src/ references bg-forest', () => {
    const grep = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (grep(full)) return true;
        } else if (entry.name.endsWith('.js') || entry.name.endsWith('.jsx')) {
          if (fs.readFileSync(full, 'utf-8').includes('bg-forest')) return true;
        }
      }
      return false;
    };
    expect(grep(SRC)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Fix 3: Error boundaries exist in all route groups
// ---------------------------------------------------------------------------
describe('Fix 3: Error boundaries', () => {
  const routeGroups = ['(marketing)', '(auth)', '(portal)', '(admin)'];

  routeGroups.forEach((group) => {
    it(`error.js exists in ${group}`, () => {
      expect(fileExists(`src/app/${group}/error.js`)).toBe(true);
    });

    it(`${group}/error.js has 'use client' directive`, () => {
      const content = readFile(`src/app/${group}/error.js`);
      expect(content.trimStart().startsWith("'use client'")).toBe(true);
    });

    it(`${group}/error.js exports a default function`, () => {
      const content = readFile(`src/app/${group}/error.js`);
      expect(content).toMatch(/export default function/);
    });

    it(`${group}/error.js accepts error and reset props`, () => {
      const content = readFile(`src/app/${group}/error.js`);
      expect(content).toContain('error');
      expect(content).toContain('reset');
    });

    it(`${group}/error.js has a retry button that calls reset`, () => {
      const content = readFile(`src/app/${group}/error.js`);
      expect(content).toContain('onClick={reset}');
    });
  });
});

// ---------------------------------------------------------------------------
// Fix 4: CSV export is functional (not disabled)
// ---------------------------------------------------------------------------
describe('Fix 4: CSV export in admin reporting', () => {
  it('AdminReporting imports csv-export', () => {
    const content = readFile('src/components/portal/pages/AdminReporting.jsx');
    expect(content).toContain("from '@/lib/csv-export'");
  });

  it('Export CSV button is not disabled', () => {
    const content = readFile('src/components/portal/pages/AdminReporting.jsx');
    expect(content).not.toContain('title="Export coming soon"');
    expect(content).not.toContain('opacity-60');
  });

  it('Export CSV button has an onClick handler', () => {
    const content = readFile('src/components/portal/pages/AdminReporting.jsx');
    const idx = content.indexOf('Export CSV');
    const surrounding = content.slice(Math.max(0, idx - 1000), idx + 20);
    expect(surrounding).toContain('onClick');
  });

  it('csv-export.js utility exists', () => {
    expect(fileExists('src/lib/csv-export.js')).toBe(true);
  });

  it('csv-export.js exports generateCSV and downloadCSV', () => {
    const content = readFile('src/lib/csv-export.js');
    expect(content).toContain('export function generateCSV');
    expect(content).toContain('export function downloadCSV');
  });
});

// ---------------------------------------------------------------------------
// Fix 5: Sitemap and layout use env var for site URL
// ---------------------------------------------------------------------------
describe('Fix 5: Site URL from env var', () => {
  it('next-sitemap.config.js reads from NEXT_PUBLIC_SITE_URL', () => {
    const content = readFile('next-sitemap.config.js');
    expect(content).toContain('process.env.NEXT_PUBLIC_SITE_URL');
  });

  it('next-sitemap.config.js has fallback URL', () => {
    const content = readFile('next-sitemap.config.js');
    expect(content).toContain('recyclinggroup.com');
  });

  it('layout.js uses SITE_URL constant instead of hardcoded URL in JSON-LD', () => {
    const content = readFile('src/app/layout.js');
    expect(content).toContain("process.env.NEXT_PUBLIC_SITE_URL || 'https://recyclinggroup.com'");
    expect(content).toContain('url: SITE_URL');
  });
});
