import Link from 'next/link';
import { verifySession } from '@/lib/dal';

export const metadata = {
  title: 'Access denied',
};

export default async function ForbiddenPage() {
  const session = await verifySession();
  const isAdmin = session?.profile?.role === 'admin';
  const dashboardHref = isAdmin ? '/admin/dashboard' : '/portal/dashboard';
  const dashboardLabel = isAdmin ? 'Go to admin' : 'Go to portal';

  return (
    <main
      id="main-content"
      className="min-h-screen flex items-center justify-center bg-offwhite px-6"
    >
      <div className="max-w-md text-center">
        <p className="text-sm uppercase tracking-wide text-text-secondary">
          403
        </p>
        <h1 className="mt-2 font-serif text-4xl text-text-primary">
          You don&rsquo;t have access to that page
        </h1>
        <p className="mt-4 text-text-secondary">
          Your account isn&rsquo;t provisioned for this area. If you believe
          this is a mistake, contact your American Resources representative.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href={dashboardHref}
            className="inline-flex items-center rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-light"
          >
            {dashboardLabel}
          </Link>
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-text-primary/20 px-4 py-2 text-sm font-medium text-text-primary hover:bg-text-primary/5"
          >
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
