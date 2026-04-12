'use client';

import { PortalPageHeader } from '../PortalShell';
import { Card, CardHeader } from '../Card';
import { usePortalAuth } from '../PortalAuthContext';
import { getPersonInitials } from '@/lib/materials';

export function AdminSettings() {
  const { user } = usePortalAuth();

  return (
    <>
      <PortalPageHeader title="Settings" />
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-8 lg:px-8">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Portal owner" />
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-copper font-sans text-[1.25rem] font-semibold text-white">
                {user ? getPersonInitials(user.name) : '?'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-[1.125rem] font-semibold text-text-primary">
                  {user?.name || '—'}
                </p>
                <p className="mt-0.5 font-sans text-[0.8125rem] text-text-muted">
                  {user?.email || '—'}
                </p>
                <p className="mt-0.5 font-sans text-[0.75rem] uppercase tracking-wide text-text-muted">
                  Administrator
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="py-6 text-center">
              <p className="font-sans text-[0.9375rem] text-text-primary">More settings coming soon</p>
              <p className="mt-1 font-sans text-[0.8125rem] text-text-muted">
                Notification prefs, team management, and integrations land in a future update.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
