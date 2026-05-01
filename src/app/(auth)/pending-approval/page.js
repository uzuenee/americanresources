import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/dal';
import { logoutAction } from '@/app/actions/auth';
import { companyInfo } from '@/data/companyInfo';

export const metadata = {
  title: 'Account Under Review',
};

export default async function PendingApprovalPage() {
  const session = await verifySession();

  if (!session) {
    redirect('/login');
  }

  if (session.profile.customerStatus !== 'pending') {
    redirect(
      session.profile.role === 'admin'
        ? '/admin/dashboard'
        : '/portal/dashboard'
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF3C7]">
        <svg
          className="h-7 w-7 text-[#92400E]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h1 className="mt-6 font-serif text-[clamp(1.75rem,3vw,2.25rem)] font-semibold leading-[1.1] text-text-primary">
        Your account is under review
      </h1>
      <p className="mt-3 max-w-sm font-sans text-[0.9375rem] leading-relaxed text-text-muted">
        Thank you for signing up. Our team is reviewing your information and
        will be in touch soon. You&apos;ll receive an email once your account
        is approved.
      </p>
      <p className="mt-4 font-sans text-[0.8125rem] text-text-muted">
        Questions? Reach us at{' '}
        <a
          href={`mailto:${companyInfo.email}`}
          className="text-navy-light hover:underline"
        >
          {companyInfo.email}
        </a>{' '}
        or{' '}
        <a
          href={companyInfo.phoneHref}
          className="text-navy-light hover:underline"
        >
          {companyInfo.phone}
        </a>
        .
      </p>
      <form action={logoutAction} className="mt-8">
        <button
          type="submit"
          className="rounded-sm border border-border bg-surface px-6 py-2.5 font-sans text-[0.8125rem] font-medium text-text-muted transition-colors hover:border-navy hover:text-text-primary"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
