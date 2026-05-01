import Image from 'next/image';
import Link from 'next/link';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { createClient } from '@/lib/supabase/server';
import { articles } from '@/data/articles';
const guides = articles.filter((a) => a.type === 'guide');
import { normalizeCmsPost } from '@/lib/article-utils';

export const metadata = {
  title: 'Guides',
  description:
    "In-depth guides to help your business navigate waste management, compliance, and sustainability in the Atlanta metro area.",
  openGraph: {
    type: 'website',
    title: 'Guides — American Resources',
    description: 'In-depth guides to help your business navigate waste management, compliance, and sustainability in the Atlanta metro area.',
  },
  twitter: {
    card: 'summary',
    title: 'Guides — American Resources',
    description: 'In-depth guides to help your business navigate waste management, compliance, and sustainability in the Atlanta metro area.',
  },
};

export default async function GuidesListingPage() {
  const supabase = await createClient();

  const { data: cmsGuides } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, type, status, hero_image, hero_alt, hero_credit, published_at, read_time_override, body, key_takeaways, faqs, footnotes, meta_description, category_id, content_categories(name)')
    .eq('type', 'guide')
    .eq('status', 'published')
    .eq('visibility', 'public')
    .order('published_at', { ascending: false });

  const normalizedCms = (cmsGuides ?? []).map((row) => normalizeCmsPost({
    ...row,
    category_name: row.content_categories?.name ?? '',
  }));

  // Merge: CMS guides first, then static (skip matching slugs)
  const cmsSlugSet = new Set(normalizedCms.map((g) => g.slug));
  const staticFiltered = guides.filter((g) => !cmsSlugSet.has(g.slug));
  const allGuides = [...normalizedCms, ...staticFiltered];

  return (
    <>
      {/* Page header */}
      <section className="bg-offwhite pt-28 pb-12 lg:pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-16">
          <AnimateOnScroll>
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex items-center gap-2 font-sans text-sm text-text-muted">
                <li className="flex items-center gap-2">
                  <Link href="/" className="hover:text-navy transition-colors">Home</Link>
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden="true">&rarr;</span>
                  <span className="text-text-primary" aria-current="page">Guides</span>
                </li>
              </ol>
            </nav>
            <Eyebrow>RESOURCES</Eyebrow>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold uppercase text-text-primary leading-[1.1] tracking-[-0.01em]">
              Recycling Guides
            </h1>
            <p className="font-sans text-lg md:text-xl text-text-muted leading-relaxed mt-4 max-w-2xl">
              In-depth guides to help your business navigate waste management, compliance, and sustainability.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Guide cards grid */}
      <section className="bg-offwhite pb-12 md:pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-16">
          {allGuides.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {allGuides.map((guide, i) => (
                <AnimateOnScroll key={guide.slug} delay={i * 0.08}>
                  <Link href={`/guides/${guide.slug}`} className="group block h-full">
                    <article className="bg-surface rounded-xl border border-border/60 overflow-hidden transition-colors duration-200 hover:border-copper/40 h-full flex flex-col">
                      {guide.image && (
                        <div className="relative aspect-[16/9] overflow-hidden rounded-t-xl">
                          <Image
                            src={guide.image}
                            alt={guide.heroAlt || guide.title}
                            fill
                            className="object-cover editorial-image transition-transform duration-500 group-hover:scale-[1.02]"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                          />
                        </div>
                      )}
                      <div className="p-6 flex flex-col flex-1">
                        {guide.category && (
                          <span className="inline-block self-start font-sans text-xs font-medium uppercase tracking-wider text-copper mb-2">
                            {guide.category}
                          </span>
                        )}
                        <h2 className="font-serif text-lg md:text-[1.25rem] text-text-primary leading-tight group-hover:text-navy-light transition-colors duration-200">
                          {guide.title}
                        </h2>
                        <p className="font-sans text-[0.9375rem] text-text-muted leading-relaxed mt-2 line-clamp-2 flex-1">
                          {guide.description || guide.excerpt}
                        </p>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                          {guide.readTime && (
                            <span className="font-sans text-[0.8125rem] text-text-muted">
                              {guide.readTime}
                            </span>
                          )}
                          <span className="font-sans text-sm font-medium text-copper group-hover:text-copper-dark transition-colors duration-200">
                            Read guide &rarr;
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          )}
          {allGuides.length === 0 && (
            <p className="font-sans text-text-muted text-center py-16">
              No guides yet.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
