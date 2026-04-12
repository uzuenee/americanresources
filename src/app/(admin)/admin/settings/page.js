import { requireAdmin } from '@/lib/dal';
import { AdminSettings } from '@/components/portal/pages/AdminSettings';

export const metadata = { title: 'Settings' };

export default async function AdminSettingsPage() {
  await requireAdmin();
  return <AdminSettings />;
}
