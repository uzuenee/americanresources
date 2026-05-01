import { redirect } from 'next/navigation';
import { SignupForm } from '@/components/portal/SignupForm';
import { verifySession } from '@/lib/dal';

export const metadata = {
  title: 'Create Account',
  description: 'Create your American Resources recycling portal account.',
};

export default async function SignupPage() {
  const session = await verifySession();
  if (session) {
    redirect(session.profile.role === 'admin' ? '/admin/dashboard' : '/portal/dashboard');
  }

  return <SignupForm />;
}
