'use client';

import { useActionState, useMemo, useState } from 'react';
import Link from 'next/link';
import { FormField } from './FormField';
import { EyeIcon, EyeOffIcon, ArrowRightIcon } from './icons';
import { updatePasswordAction } from '@/app/actions/auth';
import { cn } from '@/utils/cn';

const initialState = { error: null };

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
// Brand-token classes in the same rhythm as the accent/copper/sage palette.
// Weak starts warm (copper-light), peaks at success green — matches the
// progress semantics users expect without reaching for off-brand greys.
const STRENGTH_BG = ['bg-copper-light', 'bg-copper', 'bg-sage', 'bg-success'];

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    updatePasswordAction,
    initialState
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const strength = useMemo(() => scorePassword(password), [password]);

  return (
    <div>
      <p className="font-sans text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-copper">
        Reset password
      </p>
      <h1 className="mt-2 font-serif text-[clamp(2.25rem,3vw,2.75rem)] font-semibold leading-[1.05] text-text-primary">
        Choose a new password.
      </h1>
      <p className="mt-2 font-sans text-[0.9375rem] text-text-muted">
        Eight characters minimum. Mix it up so it&apos;s hard to guess.
      </p>

      <form action={formAction} noValidate className="mt-8 space-y-5">
        <FormField label="New password" name="password">
          {({ id, className }) => (
            <div className="relative">
              <input
                id={id}
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

        {password && (
          <div className="space-y-1.5">
            <div className="flex h-1 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'h-full flex-1 rounded-full transition-colors duration-200',
                    i < strength
                      ? STRENGTH_BG[Math.min(strength - 1, 3)]
                      : 'bg-border/60'
                  )}
                />
              ))}
            </div>
            <p className="font-sans text-[0.75rem] text-text-muted">
              Strength: {STRENGTH_LABELS[strength]}
            </p>
          </div>
        )}

        <FormField
          label="Confirm new password"
          name="confirm"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="••••••••"
          required
        />

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
          {isPending ? 'Updating…' : 'Update password'}
          {!isPending && (
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          )}
        </button>

        <p className="text-center font-sans text-[0.875rem] text-text-muted">
          Changed your mind?{' '}
          <Link href="/login" className="font-semibold text-navy-light hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
