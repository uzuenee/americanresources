import { AdminPortalShell } from '@/components/portal/AdminPortalShell';
import { PortalAuthProvider } from '@/components/portal/PortalAuthContext';
import { getAdminPortalSession } from '@/lib/portal-session';

export const metadata = {
  title: 'Dispatch',
};

export default async function AdminLayout({ children }) {
  const session = await getAdminPortalSession();

  return (
    <PortalAuthProvider initialSession={session}>
      <AdminPortalShell>{children}</AdminPortalShell>
    </PortalAuthProvider>
  );
}
