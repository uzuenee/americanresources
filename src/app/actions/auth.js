'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// All three actions are designed for React 19's useActionState hook:
// (prevState, formData) => newState. They return `{ error }` on validation or
// auth failures and redirect() on success (redirect throws, so the return is
// only reached on error).

function stringField(formData, name) {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export async function loginAction(_prevState, formData) {
  const email = stringField(formData, 'email');
  const password = formData.get('password');

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

  redirect(destination);
}

export async function signupAction(_prevState, formData) {
  const company = stringField(formData, 'company');
  const fullName = stringField(formData, 'fullName');
  const email = stringField(formData, 'email');
  const phone = stringField(formData, 'phone');
  const password = formData.get('password');
  const agreed = formData.get('agreed') === 'on';

  const errors = {};
  if (!company) errors.company = 'Company is required.';
  if (!fullName) errors.fullName = 'Your name is required.';
  if (!email) errors.email = 'Work email is required.';
  if (!password || String(password).length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }
  if (!agreed) errors.agreed = 'Accept the terms to continue.';

  if (Object.keys(errors).length > 0) {
    return { error: null, fieldErrors: errors };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password: String(password),
    options: {
      data: {
        company,
        full_name: fullName,
        phone,
      },
    },
  });

  if (error) {
    // Supabase returns the same shape for "already registered" vs. other
    // failures, so pass through the raw message but sanitize for the UI.
    return {
      error:
        error.message?.toLowerCase().includes('already')
          ? 'An account with that email already exists.'
          : 'Could not create your account. Please try again.',
    };
  }

  redirect('/portal/dashboard');
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
