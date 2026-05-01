import { Heading, Section, Text } from '@react-email/components';
import { Layout } from './_components/Layout';
import { BrandButton } from './_components/BrandButton';
import { InfoRow } from './_components/InfoRow';

export function AdminPickupCompleted({
  company,
  materialLabel,
  weightLbs,
  entryDateLabel,
  adminUrl,
}) {
  return (
    <Layout preview={`Pickup complete: ${company} — ${weightLbs} lbs ${materialLabel}`}>
      <Text className="m-0 text-[12px] leading-[18px] uppercase tracking-[2px] text-success font-semibold">
        Pickup complete
      </Text>
      <Heading
        as="h1"
        className="mt-[8px] mb-0 font-serif text-[26px] leading-[32px] font-semibold text-text-primary"
      >
        {company} — {weightLbs} lbs loaded
      </Heading>

      <Section className="bg-offwhite-alt rounded-[6px] p-[20px] mt-[24px]">
        <InfoRow label="Material" value={materialLabel} />
        <InfoRow label="Weight" value={`${weightLbs} lbs`} />
        <InfoRow label="Picked up" value={entryDateLabel} />
      </Section>

      <Text className="mt-[28px] mb-0 text-[15px] leading-[24px] text-text-primary">
        <BrandButton variant="secondary" href={adminUrl}>View customer</BrandButton>
      </Text>
    </Layout>
  );
}

AdminPickupCompleted.PreviewProps = {
  company: 'Mitchell Manufacturing',
  materialLabel: 'Metal',
  weightLbs: 1240,
  entryDateLabel: 'Tuesday, March 19, 2026',
  adminUrl: 'https://example.com/admin/customers/abc-123',
};

export default AdminPickupCompleted;
