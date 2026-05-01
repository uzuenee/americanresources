import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/dal';
import { LoginForm } from '@/components/portal/LoginForm';

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your American Resources recycling portal account.',
};

export default async function LoginPage({ searchParams }) {
  const session = await verifySession();
  if (session) {
    redirect(session.profile.role === 'admin' ? '/admin/dashboard' : '/portal/dashboard');
  }

  const sp = await searchParams;
  const redirectTo = sp?.redirect || '';

  return <LoginForm redirectTo={redirectTo} />;
}
