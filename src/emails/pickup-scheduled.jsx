import { Heading, Section, Text } from '@react-email/components';
import { Layout } from './_components/Layout';
import { BrandButton } from './_components/BrandButton';
import { InfoRow } from './_components/InfoRow';
import { companyInfo } from '@/data/companyInfo';

export function PickupScheduled({
  fullName,
  company,
  materialLabel,
  scheduledDateLabel,
  scheduledWindowLabel,
  dashboardUrl,
}) {
  const greeting = fullName ? `Hi ${fullName.split(' ')[0]},` : 'Hi there,';
  return (
    <Layout preview={`Pickup confirmed for ${scheduledDateLabel} (${scheduledWindowLabel}).`}>
      <Text className="m-0 text-[12px] leading-[18px] uppercase tracking-[2px] text-sage font-semibold">
        Pickup scheduled
      </Text>
      <Heading
        as="h1"
        className="mt-[8px] mb-0 font-serif text-[30px] leading-[36px] font-semibold text-text-primary"
      >
        You&apos;re on the schedule for {scheduledDateLabel.split(',')[0]}.
      </Heading>

      <Text className="mt-[16px] mb-0 text-[15px] leading-[24px] text-text-primary">
        {greeting}
      </Text>

      <Text className="mt-[12px] mb-[24px] text-[15px] leading-[24px] text-text-primary">
        Your pickup for <strong>{company}</strong> is confirmed. Our driver will
        call your site contact when they&apos;re 30 minutes out.
      </Text>

      <Section className="bg-sage-light rounded-[6px] p-[20px] mt-[8px]">
        <InfoRow label="Material" value={materialLabel} />
        <InfoRow label="Date" value={scheduledDateLabel} />
        <InfoRow label="Time window" value={scheduledWindowLabel} />
      </Section>

      <Text className="mt-[28px] mb-[24px] text-[15px] leading-[24px] text-text-primary">
        <BrandButton variant="secondary" href={dashboardUrl}>
          View in dashboard
        </BrandButton>
      </Text>

      <Text className="mt-[20px] mb-0 text-[13px] leading-[20px] text-text-muted">
        Need to reschedule? Reply to this email or call {companyInfo.phone} — we
        appreciate as much notice as you can give.
      </Text>
    </Layout>
  );
}

PickupScheduled.PreviewProps = {
  fullName: 'Sarah Mitchell',
  company: 'Mitchell Manufacturing',
  materialLabel: 'Metal',
  scheduledDateLabel: 'Tuesday, March 19, 2026',
  scheduledWindowLabel: 'Morning (8am–12pm)',
  dashboardUrl: 'https://example.com/portal/dashboard',
};

export default PickupScheduled;
