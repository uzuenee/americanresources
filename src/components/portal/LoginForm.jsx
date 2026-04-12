'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { FormField } from './FormField';
import { EyeIcon, EyeOffIcon, ArrowRightIcon } from './icons';
import { loginAction } from '@/app/actions/auth';

const initialState = { error: null };

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
            <a
              href="mailto:info@recyclinggroup.com?subject=Password%20reset%20request"
              className="font-sans text-[0.8125rem] text-navy-light hover:underline"
            >
              Forgot password?
            </a>
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
