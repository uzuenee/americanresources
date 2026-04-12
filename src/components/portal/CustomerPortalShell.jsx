'use client';

import { PortalShell } from './PortalShell';
import {
  LayoutDashboardIcon,
  HistoryIcon,
  TruckIcon,
  Building2Icon,
} from './icons';

const customerNavItems = [
  { label: 'Dashboard', href: '/portal/dashboard', icon: LayoutDashboardIcon },
  { label: 'Load history', href: '/portal/history', icon: HistoryIcon },
  { label: 'Request a pickup', href: '/portal/request', icon: TruckIcon },
  { label: 'Account', href: '/portal/account', icon: Building2Icon },
];

export function CustomerPortalShell({ children }) {
  return (
    <PortalShell navItems={customerNavItems}>{children}</PortalShell>
  );
}
