import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PageTransition } from '@/components/PageTransition';
import { verifySession } from '@/lib/dal';

export default async function MarketingLayout({ children }) {
  let authState = null;
  try {
    const session = await verifySession();
    if (session) {
      authState = {
        name: session.profile.full_name || session.user.email?.split('@')[0] || 'Account',
        portalHref:
          session.profile.role === 'admin'
            ? '/admin/dashboard'
            : '/portal/dashboard',
      };
    }
  } catch {
    // Auth check failed — show unauthenticated nav
  }

  return (
    <>
      <Navbar authState={authState} />
      <main id="main-content">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
