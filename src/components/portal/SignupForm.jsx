'use client';

import { useActionState, useMemo, useState } from 'react';
import Link from 'next/link';
import { FormField } from './FormField';
import { EyeIcon, EyeOffIcon, ArrowRightIcon } from './icons';
import { signupAction } from '@/app/actions/auth';

function scorePassword(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password) || password.length >= 12) score += 1;
  return Math.min(score, 4);
}

const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

const initialState = { error: null, fieldErrors: {} };

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, initialState);

  // Password strength and visibility toggle stay client-side for instant
  // feedback — the server action re-validates before hitting Supabase.
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');

  function formatPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits.length ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  const strength = useMemo(() => scorePassword(password), [password]);
  const fieldErrors = state?.fieldErrors ?? {};

  return (
    <div>
      <p className="font-sans text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-copper">
        New account
      </p>
      <h1 className="mt-2 font-serif text-[clamp(2.25rem,3vw,2.75rem)] font-semibold leading-[1.05] text-text-primary">
        Start tracking your loads.
      </h1>
      <p className="mt-2 font-sans text-[0.9375rem] text-text-muted">
        A few details and you&apos;re in.
      </p>

      <form action={formAction} noValidate className="mt-8 space-y-4">
        <FormField
          label="Company"
          name="company"
          placeholder="Acme Manufacturing"
          required
          error={fieldErrors.company}
        />
        <FormField
          label="Your name"
          name="fullName"
          placeholder="Jane Smith"
          required
          error={fieldErrors.fullName}
        />
        <FormField
          label="Work email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
          error={fieldErrors.email}
        />
        <FormField label="Phone">
          {({ id, className }) => (
            <input
              id={id}
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="numeric"
              placeholder="(770) 555-0123"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              className={className}
            />
          )}
        </FormField>
        <div>
          <FormField label="Password" required error={fieldErrors.password}>
            {({ id, className }) => (
              <div className="relative">
                <input
                  id={id}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
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
          <div className="mt-2 flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="h-1 flex-1 rounded-full transition-colors duration-200"
                  style={{
                    backgroundColor:
                      i < strength
                        ? ['#DEB990', '#C4956A', '#6B7F5E', '#059669'][Math.min(strength - 1, 3)]
                        : 'rgba(221, 217, 210, 0.6)',
                  }}
                />
              ))}
            </div>
            <span className="w-16 text-right font-sans text-[0.6875rem] text-text-muted">
              {STRENGTH_LABELS[strength]}
            </span>
          </div>
        </div>

        <div>
          <label className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              name="agreed"
              className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-sm border-border text-navy focus:ring-navy-light"
            />
            <span className="font-sans text-[0.8125rem] text-text-muted">
              I agree to the{' '}
              <a href="#" className="text-navy-light underline">Terms of Service</a> and{' '}
              <a href="#" className="text-navy-light underline">Privacy Policy</a>.
            </span>
          </label>
          {fieldErrors.agreed && (
            <p className="mt-1 font-sans text-[0.75rem] text-danger">{fieldErrors.agreed}</p>
          )}
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
          {isPending ? 'Creating account…' : 'Create account'}
          {!isPending && <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />}
        </button>

        <p className="text-center font-sans text-[0.875rem] text-text-muted">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-navy-light hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
