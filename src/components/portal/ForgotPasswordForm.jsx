'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { FormField } from './FormField';
import { ArrowRightIcon, MailIcon } from './icons';
import { requestPasswordResetAction } from '@/app/actions/auth';

const initialState = { error: null };

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordResetAction,
    initialState
  );
  const [email, setEmail] = useState('');
  const [clientError, setClientError] = useState('');

  const emailError = clientError || state?.error;

  const validateBeforeSubmit = (e) => {
    const trimmed = email.trim();
    if (!trimmed) {
      e.preventDefault();
      setClientError('Enter your email address.');
      return;
    }
    if (!isEmail(trimmed)) {
      e.preventDefault();
      setClientError('Please enter a valid email address.');
    }
  };

  if (state?.success) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy/10">
          <MailIcon className="h-7 w-7 text-navy" />
        </div>
        <h1 className="mt-6 font-serif text-[clamp(1.75rem,3vw,2.25rem)] font-semibold leading-[1.1] text-text-primary">
          Check your email
        </h1>
        <p className="mt-3 max-w-sm font-sans text-[0.9375rem] leading-relaxed text-text-muted">
          If an account exists for that address, we&apos;ve sent a reset link.
          The link expires in one hour.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex items-center gap-2 font-sans text-[0.9375rem] font-semibold text-navy-light transition-colors hover:underline"
        >
          Back to sign in
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="font-sans text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-copper">
        Reset password
      </p>
      <h1 className="mt-2 font-serif text-[clamp(2.25rem,3vw,2.75rem)] font-semibold leading-[1.05] text-text-primary">
        Forgot your password?
      </h1>
      <p className="mt-2 font-sans text-[0.9375rem] text-text-muted">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form action={formAction} onSubmit={validateBeforeSubmit} noValidate className="mt-8 space-y-5">
        <FormField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (clientError) setClientError('');
          }}
          error={emailError}
        />

        <button
          type="submit"
          disabled={isPending}
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-sm border-b-2 border-copper bg-accent font-sans text-[0.9375rem] font-semibold text-white transition-all duration-200 hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? 'Sending…' : 'Send reset link'}
          {!isPending && (
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          )}
        </button>

        <p className="text-center font-sans text-[0.875rem] text-text-muted">
          Remembered it?{' '}
          <Link href="/login" className="font-semibold text-navy-light hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
