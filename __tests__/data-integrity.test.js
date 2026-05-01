import { describe, it, expect } from 'vitest';
import { services } from '@/data/services';
import { faqCategories } from '@/data/faq';
import { testimonials } from '@/data/testimonials';
import { companyInfo } from '@/data/companyInfo';
import { articles } from '@/data/articles';

// ---------------------------------------------------------------------------
// Services data
// ---------------------------------------------------------------------------
describe('services data', () => {
  it('has exactly 6 services', () => {
    expect(services).toHaveLength(6);
  });

  it('each service has required fields', () => {
    for (const svc of services) {
      expect(svc.slug).toBeTruthy();
      expect(svc.title).toBeTruthy();
      expect(svc.shortTitle).toBeTruthy();
      expect(svc.tagline).toBeTruthy();
      expect(svc.heroImage).toBeTruthy();
      expect(svc.heroBlurDataURL).toBeTruthy();
      expect(svc.galleryImage).toBeTruthy();
    }
  });

  it('each service has description array with at least 2 paragraphs', () => {
    for (const svc of services) {
      expect(Array.isArray(svc.description)).toBe(true);
      expect(svc.description.length).toBeGreaterThanOrEqual(2);
      svc.description.forEach((p) => {
        expect(typeof p).toBe('string');
        expect(p.length).toBeGreaterThan(10);
      });
    }
  });

  it('each service has at least 4 benefits', () => {
    for (const svc of services) {
      expect(svc.benefits.length).toBeGreaterThanOrEqual(4);
      svc.benefits.forEach((b) => {
        expect(b.title).toBeTruthy();
        expect(b.description).toBeTruthy();
      });
    }
  });

  it('each service has at least 3 differentiators', () => {
    for (const svc of services) {
      expect(svc.differentiators.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('each service has FAQ items', () => {
    for (const svc of services) {
      expect(svc.faq.length).toBeGreaterThanOrEqual(3);
      svc.faq.forEach((f) => {
        expect(f.q).toBeTruthy();
        expect(f.a).toBeTruthy();
      });
    }
  });

  it('each service has related slugs that exist', () => {
    const allSlugs = services.map((s) => s.slug);
    for (const svc of services) {
      expect(svc.relatedSlugs.length).toBeGreaterThanOrEqual(1);
      svc.relatedSlugs.forEach((slug) => {
        expect(allSlugs).toContain(slug);
      });
    }
  });

  it('all slugs are unique', () => {
    const slugs = services.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('no service references itself in relatedSlugs', () => {
    for (const svc of services) {
      expect(svc.relatedSlugs).not.toContain(svc.slug);
    }
  });

  it('hero images use valid file extensions', () => {
    for (const svc of services) {
      expect(svc.heroImage).toMatch(/\.(jpe?g|png|webp|avif)$/i);
      expect(svc.galleryImage).toMatch(/\.(jpe?g|png|webp|avif)$/i);
    }
  });

  it('blur data URLs are valid base64 data URIs', () => {
    for (const svc of services) {
      expect(svc.heroBlurDataURL).toMatch(/^data:image\/(jpeg|png|webp);base64,/);
    }
  });
});

// ---------------------------------------------------------------------------
// FAQ data
// ---------------------------------------------------------------------------
describe('faqCategories data', () => {
  it('has 4 categories', () => {
    expect(faqCategories).toHaveLength(4);
  });

  it('each category has a name and questions', () => {
    faqCategories.forEach((cat) => {
      expect(cat.category).toBeTruthy();
      expect(Array.isArray(cat.questions)).toBe(true);
      expect(cat.questions.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('each question has both q and a fields', () => {
    faqCategories.forEach((cat) => {
      cat.questions.forEach((item) => {
        expect(item.q).toBeTruthy();
        expect(item.a).toBeTruthy();
        expect(typeof item.q).toBe('string');
        expect(typeof item.a).toBe('string');
      });
    });
  });

  it('category names are unique', () => {
    const names = faqCategories.map((c) => c.category);
    expect(new Set(names).size).toBe(names.length);
  });

  it('has expected category names', () => {
    const names = faqCategories.map((c) => c.category);
    expect(names).toContain('General');
    expect(names).toContain('Services');
  });
});

// ---------------------------------------------------------------------------
// Testimonials data
// ---------------------------------------------------------------------------
describe('testimonials data', () => {
  it('has at least 3 testimonials', () => {
    expect(testimonials.length).toBeGreaterThanOrEqual(3);
  });

  it('each testimonial has required fields', () => {
    testimonials.forEach((t) => {
      expect(t.quote).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.title).toBeTruthy();
      expect(t.company).toBeTruthy();
    });
  });

  it('quotes are substantial (> 20 chars)', () => {
    testimonials.forEach((t) => {
      expect(t.quote.length).toBeGreaterThan(20);
    });
  });
});

// ---------------------------------------------------------------------------
// Company info
// ---------------------------------------------------------------------------
describe('companyInfo data', () => {
  it('has company name', () => {
    expect(companyInfo.name).toBe('American Resources');
  });

  it('has valid phone number', () => {
    expect(companyInfo.phone).toMatch(/^\(\d{3}\)\s\d{3}-\d{4}$/);
    expect(companyInfo.phoneHref).toMatch(/^tel:\+\d+$/);
  });

  it('has valid email', () => {
    expect(companyInfo.email).toMatch(/@/);
  });

  it('has complete address', () => {
    expect(companyInfo.address.street).toBeTruthy();
    expect(companyInfo.address.city).toBe('Atlanta');
    expect(companyInfo.address.state).toBe('GA');
    expect(companyInfo.address.zip).toMatch(/^\d{5}$/);
    expect(companyInfo.address.full).toBeTruthy();
  });

  it('has business hours', () => {
    expect(companyInfo.hours).toBeTruthy();
    expect(companyInfo.hours).toContain('Monday');
  });

  it('has social links', () => {
    expect(companyInfo.socials.linkedin).toBeTruthy();
    expect(companyInfo.socials.facebook).toBeTruthy();
  });

  it('has founded year', () => {
    expect(companyInfo.founded).toBe(2005);
  });

  it('has stats object with expected keys', () => {
    expect(companyInfo.stats.years).toBeTruthy();
    expect(companyInfo.stats.partners).toBeTruthy();
    expect(companyInfo.stats.tonsRecycled).toBeTruthy();
    expect(companyInfo.stats.services).toBeTruthy();
    expect(companyInfo.stats.retention).toBeTruthy();
    expect(companyInfo.stats.co2Prevented).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Articles data
// ---------------------------------------------------------------------------
describe('articles data', () => {
  it('has at least 1 article', () => {
    expect(articles.length).toBeGreaterThanOrEqual(1);
  });

  it('each article has required fields', () => {
    articles.forEach((a) => {
      expect(a.slug).toBeTruthy();
      expect(a.title).toBeTruthy();
      expect(a.excerpt).toBeTruthy();
      expect(a.type).toMatch(/^(blog|guide)$/);
      expect(a.category).toBeTruthy();
      expect(a.readTime).toBeTruthy();
      expect(a.date).toBeTruthy();
    });
  });

  it('all slugs are unique', () => {
    const slugs = articles.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('each article has a body array', () => {
    articles.forEach((a) => {
      expect(Array.isArray(a.body)).toBe(true);
      expect(a.body.length).toBeGreaterThan(0);
    });
  });

  it('body blocks have valid types', () => {
    const validTypes = ['p', 'h2', 'h3', 'h4', 'image', 'list', 'table', 'callout', 'pullquote', 'hr', 'code', 'blockquote'];
    articles.forEach((a) => {
      a.body.forEach((block) => {
        expect(validTypes).toContain(block.type);
      });
    });
  });

  it('each article has metaDescription', () => {
    articles.forEach((a) => {
      expect(a.metaDescription).toBeTruthy();
    });
  });

  it('readTime format is correct', () => {
    articles.forEach((a) => {
      expect(a.readTime).toMatch(/\d+\s*min\s*read/i);
    });
  });

  it('relatedSlugs reference valid article slugs', () => {
    const allSlugs = articles.map((a) => a.slug);
    articles.forEach((a) => {
      if (a.relatedSlugs) {
        a.relatedSlugs.forEach((slug) => {
          expect(allSlugs).toContain(slug);
        });
      }
    });
  });

  it('image blocks have src and alt', () => {
    articles.forEach((a) => {
      const imageBlocks = a.body.filter((b) => b.type === 'image');
      imageBlocks.forEach((img) => {
        expect(img.src).toBeTruthy();
        expect(img.alt).toBeDefined();
      });
    });
  });

  it('list blocks have items array', () => {
    articles.forEach((a) => {
      const listBlocks = a.body.filter((b) => b.type === 'list');
      listBlocks.forEach((list) => {
        expect(Array.isArray(list.items)).toBe(true);
        expect(list.items.length).toBeGreaterThan(0);
      });
    });
  });

  it('FAQ items have question and answer fields', () => {
    articles.forEach((a) => {
      if (a.faqs && a.faqs.length > 0) {
        a.faqs.forEach((faq) => {
          expect(faq.question).toBeTruthy();
          expect(faq.answer).toBeTruthy();
        });
      }
    });
  });
});
