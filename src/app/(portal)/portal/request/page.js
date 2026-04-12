import { getCustomerPortalSession } from '@/lib/portal-session';
import { CustomerRequestPage } from '@/components/portal/pages/CustomerRequest';

export const metadata = { title: 'Request a pickup' };

export default async function CustomerRequestRoute() {
  const { customer } = await getCustomerPortalSession();
  return <CustomerRequestPage customer={customer} />;
}
