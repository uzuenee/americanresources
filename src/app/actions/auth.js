'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  PASSWORD_RECOVERY_COOKIE,
  PASSWORD_RECOVERY_COOKIE_OPTIONS,
} from '@/lib/auth-recovery';
import {
  sendSignupConfirmation,
  sendPasswordReset,
  sendAdminSignupAlert,
} from '@/lib/email/events';

// All actions are designed for React 19's useActionState hook:
// (prevState, formData) => newState. Login/logout redirect on success;
// signup and password actions return state for the form to display.

function stringField(formData, name) {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'http://localhost:3000'
  );
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Build a URL that lands on our /auth/callback route handler so we control
// verification + cookie setting (rather than letting Supabase's hosted /verify
// endpoint handle it and bounce through). The token_hash + type are read by
// the route handler and passed to supabase.auth.verifyOtp().
function callbackUrl({ tokenHash, type, next }) {
  const params = new URLSearchParams({ token_hash: tokenHash, type, next });
  return `${siteUrl()}/auth/callback?${params.toString()}`;
}

export async function loginAction(_prevState, formData) {
  const email = stringField(formData, 'email');
  const password = formData.get('password');
  const redirectTo = stringField(formData, 'redirectTo');

  if (!email || !password) {
    return { error: 'Enter your email and password to sign in.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: String(password),
  });

  if (error) {
    return { error: 'Those credentials did not match our records.' };
  }

  // Look up the role so we can send admins to /admin and customers to /portal.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let destination = '/portal/dashboard';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile?.role === 'admin') {
      destination = '/admin/dashboard';
    }
  }

  // Honor the return URL if it's a safe internal path
  if (
    redirectTo &&
    redirectTo.startsWith('/') &&
    !redirectTo.startsWith('//') &&
    !redirectTo.startsWith('/login') &&
    !redirectTo.startsWith('/signup')
  ) {
    destination = redirectTo;
  }

  redirect(destination);
}

export async function signupAction(_prevState, formData) {
  const company = stringField(formData, 'company');
  const fullName = stringField(formData, 'fullName');
  const email = stringField(formData, 'email');
  const phone = stringField(formData, 'phone');
  const password = formData.get('password');
  const agreed = formData.get('agreed') === 'on';

  const pickupAddress = stringField(formData, 'pickupAddress');
  const pickupAddress2 = stringField(formData, 'pickupAddress2');
  const pickupCity = stringField(formData, 'pickupCity');
  const pickupState = stringField(formData, 'pickupState');
  const pickupZip = stringField(formData, 'pickupZip');

  const errors = {};
  if (!company) errors.company = 'Company is required.';
  if (!fullName) errors.fullName = 'Your name is required.';
  if (!email) errors.email = 'Work email is required.';
  if (!password || String(password).length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }
  if (!pickupAddress) errors.pickupAddress = 'Street address is required.';
  if (!pickupCity) errors.pickupCity = 'City is required.';
  if (!pickupState) errors.pickupState = 'State is required.';
  if (!pickupZip || !/^\d{5}$/.test(pickupZip)) errors.pickupZip = 'Enter a 5-digit ZIP code.';
  if (!phone || phone.replace(/\D/g, '').length !== 10) {
    errors.phone = 'A 10-digit phone number is required.';
  }
  if (!agreed) errors.agreed = 'Accept the terms to continue.';

  if (Object.keys(errors).length > 0) {
    return { error: null, fieldErrors: errors };
  }

  // Use admin.generateLink instead of auth.signUp so Supabase doesn't try to
  // send its own email — we handle the send via Resend ourselves.
  // The handle_new_user trigger still fires, populating customers/profiles.
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'signup',
    email,
    password: String(password),
    options: {
      data: {
        company,
        full_name: fullName,
        phone,
        pickup_address: pickupAddress,
        pickup_address2: pickupAddress2,
        pickup_city: pickupCity,
        pickup_state: pickupState,
        pickup_zip: pickupZip,
      },
    },
  });

  if (error) {
    const msg = error.message?.toLowerCase() || '';
    if (error.status === 422 || /already|registered|exists/.test(msg)) {
      return { error: 'An account with that email already exists.' };
    }
    return { error: 'Could not create your account. Please try again.' };
  }

  const tokenHash = data?.properties?.hashed_token;
  if (tokenHash) {
    const confirmUrl = callbackUrl({
      tokenHash,
      type: 'signup',
      next: '/portal/dashboard?welcome=1',
    });
    // Best-effort: a Resend hiccup must not fail the signup. The user can
    // request a resend via the password-reset path or contact support.
    await sendSignupConfirmation({ to: email, fullName, company, confirmUrl });
  }

  const { data: newCustomer } = await admin
    .from('customers')
    .select('id')
    .eq('contact_email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'http://localhost:3000';

  sendAdminSignupAlert({
    company,
    contactName: fullName,
    contactEmail: email,
    contactPhone: phone,
    address: {
      street: pickupAddress,
      city: pickupCity,
      state: pickupState,
      zip: pickupZip,
    },
    adminUrl: newCustomer
      ? `${baseUrl}/admin/customers/${newCustomer.id}`
      : `${baseUrl}/admin/customers`,
  });

  return { success: true };
}

export async function requestPasswordResetAction(_prevState, formData) {
  const email = stringField(formData, 'email');

  if (!email) {
    return { error: 'Enter your email address.' };
  }
  if (!isEmail(email)) {
    return { error: 'Please enter a valid email address.' };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
  });

  // Always present a success state — never reveal whether the email is on file.
  const tokenHash = data?.properties?.hashed_token;
  if (!error && tokenHash) {
    let fullName = '';
    try {
      const { data: list } = await admin.auth.admin.listUsers();
      const match = list?.users?.find((u) => u.email === email);
      fullName = match?.user_metadata?.full_name || '';
    } catch {
      // No-op: name personalization is nice-to-have.
    }

    const resetUrl = callbackUrl({
      tokenHash,
      type: 'recovery',
      next: '/reset-password',
    });
    await sendPasswordReset({ to: email, fullName, resetUrl, tokenHash });
  }

  return { success: true };
}

export async function updatePasswordAction(_prevState, formData) {
  const password = formData.get('password');
  const confirm = formData.get('confirm');
  const cookieStore = await cookies();
  const supabase = await createClient();

  if (cookieStore.get(PASSWORD_RECOVERY_COOKIE)?.value !== '1') {
    return { error: 'This link is invalid or has expired.' };
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return { error: 'This link is invalid or has expired.' };
  }

  if (!password || String(password).length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }
  if (String(password) !== String(confirm)) {
    return { error: "Passwords don't match." };
  }

  const { error } = await supabase.auth.updateUser({
    password: String(password),
  });

  if (error) {
    if (/auth session|jwt|missing/i.test(error.message || '')) {
      return {
        error:
          'Your reset link has expired. Request a new one from the forgot-password page.',
      };
    }
    return { error: 'Could not update your password. Please try again.' };
  }

  // Sign out so the user logs in fresh with the new password.
  cookieStore.set(PASSWORD_RECOVERY_COOKIE, '', {
    ...PASSWORD_RECOVERY_COOKIE_OPTIONS,
    maxAge: 0,
  });
  await supabase.auth.signOut();
  redirect('/login?reset=ok');
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
