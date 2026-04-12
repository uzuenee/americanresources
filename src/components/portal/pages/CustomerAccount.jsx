'use client';

import { PortalPageHeader } from '../PortalShell';
import { Card, CardHeader, DefList } from '../Card';
import { StatusBadge } from '../StatusBadge';
import { MaterialChip } from '../MaterialChip';
import { getPersonInitials } from '@/lib/materials';

function formatMonthYear(iso) {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function CustomerAccount({ customer }) {
  if (!customer) return null;

  const contact = customer.contact ?? {};

  return (
    <>
      <PortalPageHeader
        title="Your account"
        subtitle="What we have on file. Call if anything needs fixing."
      />
      <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader title="Company" />
              <DefList
                items={[
                  { label: 'Company', value: customer.company },
                  { label: 'Status', value: <StatusBadge status={customer.status} /> },
                  { label: 'On file since', value: formatMonthYear(customer.since) },
                  { label: 'Pickup location', value: customer.location || '—' },
                  { label: 'Reporting', value: customer.reportingCadence },
                ]}
              />
            </Card>
            <Card>
              <CardHeader title="Streams we handle" />
              {customer.materials && customer.materials.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {customer.materials.map((m) => (
                    <MaterialChip key={m} material={m} />
                  ))}
                </div>
              ) : (
                <p className="font-sans text-[0.875rem] text-text-muted">
                  No streams on file yet. Call us and we&apos;ll add them.
                </p>
              )}
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader title="Point of contact" />
              {contact.name ? (
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-copper font-sans text-[0.9375rem] font-semibold text-white">
                    {getPersonInitials(contact.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-[1rem] font-semibold text-text-primary">
                      {contact.name}
                    </p>
                    {contact.title && (
                      <p className="mt-0.5 font-sans text-[0.8125rem] text-text-muted">
                        {contact.title}
                      </p>
                    )}
                    <div className="mt-3 space-y-1.5">
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="block font-sans text-[0.875rem] text-navy-light hover:underline"
                        >
                          {contact.email}
                        </a>
                      )}
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                          className="block font-sans text-[0.875rem] text-navy-light hover:underline"
                        >
                          {contact.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="font-sans text-[0.875rem] text-text-muted">
                  No primary contact on file.
                </p>
              )}
            </Card>
            <Card>
              <CardHeader title="Need to fix something?" />
              <p className="font-sans text-[0.875rem] text-text-primary">
                Call or email — we&apos;ll update your records same day.
              </p>
              <div className="mt-3 space-y-1 font-sans text-[0.8125rem] text-text-muted">
                <p>
                  <a href="mailto:info@recyclinggroup.com" className="text-navy-light hover:underline">
                    info@recyclinggroup.com
                  </a>
                </p>
                <p>
                  <a href="tel:+17709348248" className="text-navy-light hover:underline">
                    (770) 934-8248
                  </a>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
