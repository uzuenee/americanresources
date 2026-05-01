import { Heading, Link, Section, Text } from '@react-email/components';
import { Layout } from './_components/Layout';
import { BrandButton } from './_components/BrandButton';
import { InfoRow } from './_components/InfoRow';

export function AdminSignupAlert({
  company,
  contactName,
  contactEmail,
  contactPhone,
  pickupAddress,
  pickupCity,
  pickupState,
  pickupZip,
  adminUrl,
}) {
  const fullAddress = [
    pickupAddress,
    [pickupCity, pickupState].filter(Boolean).join(', '),
    pickupZip,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Layout preview={`New signup: ${company} — ${contactName}`}>
      <Text className="m-0 text-[12px] leading-[18px] uppercase tracking-[2px] text-[#92400E] font-semibold">
        New signup — pending approval
      </Text>
      <Heading
        as="h1"
        className="mt-[8px] mb-0 font-serif text-[26px] leading-[32px] font-semibold text-text-primary"
      >
        {company}
      </Heading>

      <Section className="bg-offwhite-alt rounded-[6px] p-[20px] mt-[24px]">
        <InfoRow label="Contact" value={contactName} />
        <InfoRow
          label="Email"
          value={
            <Link href={`mailto:${contactEmail}`} className="text-navy-light no-underline">
              {contactEmail}
            </Link>
          }
        />
        <InfoRow label="Phone" value={contactPhone || '—'} />
        <InfoRow label="Pickup at" value={fullAddress || '—'} />
      </Section>

      <Text className="mt-[28px] mb-0 text-[15px] leading-[24px] text-text-primary">
        <BrandButton href={adminUrl}>Review account</BrandButton>
      </Text>
    </Layout>
  );
}

AdminSignupAlert.PreviewProps = {
  company: 'Mitchell Manufacturing',
  contactName: 'Sarah Mitchell',
  contactEmail: 'sarah@mitchellmfg.com',
  contactPhone: '(770) 555-0123',
  pickupAddress: '4242 Industrial Blvd',
  pickupCity: 'Atlanta',
  pickupState: 'GA',
  pickupZip: '30318',
  adminUrl: 'https://example.com/admin/customers/abc-123',
};

export default AdminSignupAlert;
