import { getCustomerPortalSession } from '@/lib/portal-session';
import { CustomerAccount } from '@/components/portal/pages/CustomerAccount';

export const metadata = { title: 'Account' };

export default async function CustomerAccountPage() {
  const { customer } = await getCustomerPortalSession();
  return <CustomerAccount customer={customer} />;
}
