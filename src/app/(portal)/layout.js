import { CustomerPortalShell } from '@/components/portal/CustomerPortalShell';
import { PortalAuthProvider } from '@/components/portal/PortalAuthContext';
import { getCustomerPortalSession } from '@/lib/portal-session';

export const metadata = {
  title: 'Portal',
};

export default async function PortalLayout({ children }) {
  const session = await getCustomerPortalSession();

  return (
    <PortalAuthProvider initialSession={session}>
      <CustomerPortalShell>{children}</CustomerPortalShell>
    </PortalAuthProvider>
  );
}
