'use client';

import { Suspense, useActionState, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FormField } from './FormField';
import { EyeIcon, EyeOffIcon, ArrowRightIcon } from './icons';
import { loginAction } from '@/app/actions/auth';

const initialState = { error: null };

const URL_NOTICES = {
  reset_ok: { tone: 'success', text: 'Password updated. Sign in with your new one.' },
  confirm_expired: {
    tone: 'danger',
    text: 'That confirmation link has expired. Sign up again to receive a fresh one.',
  },
  reset_expired: {
    tone: 'danger',
    text: 'That reset link has expired. Request a new one from the forgot-password page.',
  },
  invalid_link: {
    tone: 'danger',
    text: 'That link is not valid. Request a fresh one and try again.',
  },
};

// Wrapped in <Suspense> below so useSearchParams() doesn't bail out CSR for
// the whole page during static export.
function UrlNotice() {
  const params = useSearchParams();
  const key =
    params.get('reset') === 'ok' ? 'reset_ok' : params.get('error') || null;
  const notice = key ? URL_NOTICES[key] : null;
  if (!notice) return null;
  return (
    <p
      role="status"
      className={
        notice.tone === 'success'
          ? 'mt-6 rounded-sm border border-success/30 bg-success/5 px-3 py-2 font-sans text-[0.8125rem] text-success'
          : 'mt-6 rounded-sm border border-danger/30 bg-danger/5 px-3 py-2 font-sans text-[0.8125rem] text-danger'
      }
    >
      {notice.text}
    </p>
  );
}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <p className="font-sans text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-copper">
        Portal sign-in
      </p>
      <h1 className="mt-2 font-serif text-[clamp(2.25rem,3vw,2.75rem)] font-semibold leading-[1.05] text-text-primary">
        Welcome back.
      </h1>
      <p className="mt-2 font-sans text-[0.9375rem] text-text-muted">
        Sign in to keep your loads moving.
      </p>

      <Suspense fallback={null}>
        <UrlNotice />
      </Suspense>

      <form action={formAction} noValidate className="mt-8 space-y-5">
        <FormField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
        />
        <div>
          <FormField label="Password" name="password">
            {({ id, className }) => (
              <div className="relative">
                <input
                  id={id}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                  className={className + ' pr-12'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-text-muted transition-colors hover:text-text-primary"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            )}
          </FormField>
          <div className="mt-1.5 flex justify-end">
            <Link
              href="/forgot-password"
              className="font-sans text-[0.8125rem] text-navy-light hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {state?.error && (
          <p
            role="alert"
            className="rounded-sm border border-danger/30 bg-danger/5 px-3 py-2 font-sans text-[0.8125rem] text-danger"
          >
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-sm border-b-2 border-copper bg-accent font-sans text-[0.9375rem] font-semibold text-white transition-all duration-200 hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? 'Signing in…' : 'Sign in'}
          {!isPending && (
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          )}
        </button>

        <p className="text-center font-sans text-[0.875rem] text-text-muted">
          New account?{' '}
          <Link href="/signup" className="font-semibold text-navy-light hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
