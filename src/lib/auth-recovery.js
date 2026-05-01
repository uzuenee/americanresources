import 'server-only';

export const PASSWORD_RECOVERY_COOKIE = 'ar-password-recovery';

export const PASSWORD_RECOVERY_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60,
};
