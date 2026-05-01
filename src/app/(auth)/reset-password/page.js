import Link from 'next/link';
import { cookies } from 'next/headers';
import { ResetPasswordForm } from '@/components/portal/ResetPasswordForm';
import { createClient } from '@/lib/supabase/server';
import { PASSWORD_RECOVERY_COOKIE } from '@/lib/auth-recovery';

export const metadata = {
  title: 'Reset Password',
  description: 'Choose a new password for your American Resources account.',
};

async function hasRecoverySession() {
  const cookieStore = await cookies();
  if (cookieStore.get(PASSWORD_RECOVERY_COOKIE)?.value !== '1') return false;

  const supabase = await createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  return !error && Boolean(session);
}

function InvalidResetLink() {
  return (
    <div>
      <p className="font-sans text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-copper">
        Reset password
      </p>
      <h1 className="mt-2 font-serif text-[clamp(2rem,3vw,2.5rem)] font-semibold leading-[1.05] text-text-primary">
        This link is invalid or has expired
      </h1>
      <p className="mt-3 font-sans text-[0.9375rem] leading-relaxed text-text-muted">
        Request a new password reset link to continue.
      </p>
      <Link
        href="/forgot-password"
        className="mt-8 inline-flex items-center justify-center rounded-sm border-b-2 border-copper bg-accent px-5 py-3 font-sans text-[0.9375rem] font-semibold text-white transition-colors hover:bg-accent-hover"
      >
        Request a new link
      </Link>
    </div>
  );
}

export default async function ResetPasswordPage() {
  if (!(await hasRecoverySession())) {
    return <InvalidResetLink />;
  }

  return <ResetPasswordForm />;
}
