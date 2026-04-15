import { ForgotPasswordForm } from '@/components/portal/ForgotPasswordForm';

export const metadata = {
  title: 'Forgot Password',
  description: 'Request a password reset for your American Resources account.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
