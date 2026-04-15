import { Heading, Link, Section, Text } from '@react-email/components';
import { Layout } from './_components/Layout';
import { BrandButton } from './_components/BrandButton';
import { InfoRow } from './_components/InfoRow';

export function AdminRequestAlert({
  company,
  contactName,
  contactPhone,
  contactEmail,
  materialLabel,
  estimatedWeight,
  preferredDateLabel,
  timeWindowLabel,
  accessInstructions,
  mixedDetails,
  pickupAddress,
  pickupAddress2,
  pickupCity,
  pickupState,
  pickupZip,
  adminUrl,
}) {
  const fullAddress = [
    pickupAddress,
    pickupAddress2,
    [pickupCity, pickupState].filter(Boolean).join(', '),
    pickupZip,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Layout preview={`New request: ${company} — ${materialLabel}, ${estimatedWeight} lbs`}>
      <Text className="m-0 text-[12px] leading-[18px] uppercase tracking-[2px] text-accent font-semibold">
        New pickup request
      </Text>
      <Heading
        as="h1"
        className="mt-[8px] mb-0 font-serif text-[26px] leading-[32px] font-semibold text-text-primary"
      >
        {company}
      </Heading>

      <Section className="bg-offwhite-alt rounded-[6px] p-[20px] mt-[24px]">
        <InfoRow label="Material" value={materialLabel} />
        <InfoRow label="Est. weight" value={`${estimatedWeight} lbs`} />
        <InfoRow label="Preferred date" value={preferredDateLabel} />
        <InfoRow label="Time window" value={timeWindowLabel} />
        <InfoRow label="Pickup at" value={fullAddress || '— Use customer default —'} />
        <InfoRow label="Site contact" value={`${contactName} · ${contactPhone}`} />
        <InfoRow
          label="Account email"
          value={
            <Link href={`mailto:${contactEmail}`} className="text-navy-light no-underline">
              {contactEmail}
            </Link>
          }
        />
        {accessInstructions ? (
          <InfoRow label="Access" value={accessInstructions} />
        ) : null}
        {mixedDetails ? (
          <InfoRow label="Mixed details" value={mixedDetails} />
        ) : null}
      </Section>

      <Text className="mt-[28px] mb-0 text-[15px] leading-[24px] text-text-primary">
        <BrandButton href={adminUrl}>Open in dispatch</BrandButton>
      </Text>
    </Layout>
  );
}

AdminRequestAlert.PreviewProps = {
  company: 'Mitchell Manufacturing',
  contactName: 'Sarah Mitchell',
  contactPhone: '(770) 555-0123',
  contactEmail: 'sarah@mitchellmfg.com',
  materialLabel: 'Metal',
  estimatedWeight: 500,
  preferredDateLabel: 'Tuesday, March 19, 2026',
  timeWindowLabel: 'Morning (8am–12pm)',
  accessInstructions: 'Loading dock around back. Call when you arrive.',
  mixedDetails: null,
  pickupAddress: '4242 Industrial Blvd',
  pickupAddress2: 'Suite 12',
  pickupCity: 'Atlanta',
  pickupState: 'GA',
  pickupZip: '30318',
  adminUrl: 'https://example.com/admin/dashboard',
};

export default AdminRequestAlert;
