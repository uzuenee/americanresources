import { Heading, Section, Text } from '@react-email/components';
import { Layout } from './_components/Layout';
import { BrandButton } from './_components/BrandButton';
import { InfoRow } from './_components/InfoRow';
import { companyInfo } from '@/data/companyInfo';

export function RequestSubmitted({
  fullName,
  company,
  materialLabel,
  estimatedWeight,
  preferredDateLabel,
  timeWindowLabel,
  mixedDetails,
  dashboardUrl,
}) {
  const greeting = fullName ? `Hi ${fullName.split(' ')[0]},` : 'Hi there,';
  return (
    <Layout preview={`We got your pickup request — ${materialLabel}, ${estimatedWeight} lbs est.`}>
      <Heading
        as="h1"
        className="m-0 font-serif text-[30px] leading-[36px] font-semibold text-text-primary"
      >
        We got your pickup request.
      </Heading>

      <Text className="mt-[16px] mb-0 text-[15px] leading-[24px] text-text-primary">
        {greeting}
      </Text>

      <Text className="mt-[12px] mb-[24px] text-[15px] leading-[24px] text-text-primary">
        Thanks for submitting your request for <strong>{company}</strong>. Our
        dispatcher will confirm your scheduled date and time window within one
        business day.
      </Text>

      <Section className="bg-offwhite-alt rounded-[6px] p-[20px] mt-[8px]">
        <InfoRow label="Material" value={materialLabel} />
        <InfoRow label="Est. weight" value={`${estimatedWeight} lbs`} />
        <InfoRow label="Preferred date" value={preferredDateLabel} />
        <InfoRow label="Time window" value={timeWindowLabel} />
        {mixedDetails ? (
          <InfoRow label="Mixed details" value={mixedDetails} />
        ) : null}
      </Section>

      <Text className="mt-[28px] mb-[24px] text-[15px] leading-[24px] text-text-primary">
        <BrandButton variant="secondary" href={dashboardUrl}>
          Open your dashboard
        </BrandButton>
      </Text>

      <Text className="mt-[20px] mb-0 text-[13px] leading-[20px] text-text-muted">
        Need to make a change? Reply to this email or call {companyInfo.phone}.
      </Text>
    </Layout>
  );
}

RequestSubmitted.PreviewProps = {
  fullName: 'Sarah Mitchell',
  company: 'Mitchell Manufacturing',
  materialLabel: 'Metal',
  estimatedWeight: 500,
  preferredDateLabel: 'Tuesday, March 19, 2026',
  timeWindowLabel: 'Morning (8am–12pm)',
  mixedDetails: null,
  dashboardUrl: 'https://example.com/portal/dashboard',
};

export default RequestSubmitted;
