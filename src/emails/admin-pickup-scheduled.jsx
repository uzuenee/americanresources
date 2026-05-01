import { Heading, Section, Text } from '@react-email/components';
import { Layout } from './_components/Layout';
import { BrandButton } from './_components/BrandButton';
import { InfoRow } from './_components/InfoRow';

export function AdminPickupScheduled({
  company,
  materialLabel,
  scheduledDateLabel,
  scheduledWindowLabel,
  scheduledBy,
  adminUrl,
}) {
  return (
    <Layout preview={`Pickup scheduled: ${company} — ${materialLabel}, ${scheduledDateLabel}`}>
      <Text className="m-0 text-[12px] leading-[18px] uppercase tracking-[2px] text-sage-dark font-semibold">
        Pickup scheduled
      </Text>
      <Heading
        as="h1"
        className="mt-[8px] mb-0 font-serif text-[26px] leading-[32px] font-semibold text-text-primary"
      >
        {company}
      </Heading>

      <Section className="bg-offwhite-alt rounded-[6px] p-[20px] mt-[24px]">
        <InfoRow label="Material" value={materialLabel} />
        <InfoRow label="Date" value={scheduledDateLabel} />
        <InfoRow label="Window" value={scheduledWindowLabel} />
        <InfoRow label="Scheduled by" value={scheduledBy} />
      </Section>

      <Text className="mt-[28px] mb-0 text-[15px] leading-[24px] text-text-primary">
        <BrandButton variant="secondary" href={adminUrl}>View in dispatch</BrandButton>
      </Text>
    </Layout>
  );
}

AdminPickupScheduled.PreviewProps = {
  company: 'Mitchell Manufacturing',
  materialLabel: 'Metal',
  scheduledDateLabel: 'Tuesday, March 19, 2026',
  scheduledWindowLabel: 'Morning (8am–12pm)',
  scheduledBy: 'Mike Reynolds',
  adminUrl: 'https://example.com/admin/dashboard',
};

export default AdminPickupScheduled;
