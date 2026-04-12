import { AuthShell } from '@/components/portal/AuthShell';

export const metadata = {
  title: 'Account Access',
};

export default function AuthLayout({ children }) {
  return <AuthShell>{children}</AuthShell>;
}
