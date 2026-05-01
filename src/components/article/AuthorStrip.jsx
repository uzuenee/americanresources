export function AuthorStrip() {
  return (
    <section className="bg-offwhite py-8">
      <div className="mx-auto max-w-[1200px] px-8">
        <div className="border-t border-border pt-8">
          <div className="flex items-center gap-5">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-navy font-sans text-[0.875rem] font-semibold text-white">
              AR
            </div>
            <div>
              <p className="font-sans text-[0.875rem] font-medium text-text-primary">
                Written by <span className="font-semibold">American Resources Team</span>
              </p>
              <p className="mt-0.5 font-[family-name:var(--font-reading)] text-[0.875rem] text-text-muted">
                Helping Atlanta-area businesses recycle responsibly since 2005.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
