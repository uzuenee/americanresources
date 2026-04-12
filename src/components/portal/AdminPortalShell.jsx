'use client';

import { PortalShell } from './PortalShell';
import {
  LayoutDashboardIcon,
  UsersIcon,
  BarChart3Icon,
  SettingsIcon,
} from './icons';

const adminNavItems = [
  { label: 'Dispatch', href: '/admin/dashboard', icon: LayoutDashboardIcon },
  { label: 'Accounts', href: '/admin/customers', icon: UsersIcon },
  { label: 'Reporting', href: '/admin/reporting', icon: BarChart3Icon },
  { label: 'Settings', href: '/admin/settings', icon: SettingsIcon },
];

export function AdminPortalShell({ children }) {
  return (
    <PortalShell navItems={adminNavItems}>{children}</PortalShell>
  );
}
