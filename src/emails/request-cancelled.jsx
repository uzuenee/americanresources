import { Heading, Section, Text } from '@react-email/components';
import { Layout } from './_components/Layout';
import { BrandButton } from './_components/BrandButton';
import { InfoRow } from './_components/InfoRow';
import { companyInfo } from '@/data/companyInfo';

export function RequestCancelled({
  fullName,
  company,
  materialLabel,
  preferredDateLabel,
  portalUrl,
}) {
  const greeting = fullName ? `Hi ${fullName.split(' ')[0]},` : 'Hi there,';
  return (
    <Layout preview="Your pickup request was cancelled.">
      <Text className="m-0 text-[12px] leading-[18px] uppercase tracking-[2px] text-accent font-semibold">
        Request cancelled
      </Text>
      <Heading
        as="h1"
        className="mt-[8px] mb-0 font-serif text-[30px] leading-[36px] font-semibold text-text-primary"
      >
        Your pickup request was cancelled.
      </Heading>

      <Text className="mt-[16px] mb-0 text-[15px] leading-[24px] text-text-primary">
        {greeting}
      </Text>

      <Text className="mt-[12px] mb-[24px] text-[15px] leading-[24px] text-text-primary">
        Your pending request for <strong>{company}</strong> has been cancelled
        by our dispatch team. If this was unexpected, reply to this email or
        call {companyInfo.phone} and we&apos;ll sort it out.
      </Text>

      <Section className="bg-offwhite-alt rounded-[6px] p-[20px] mt-[8px]">
        <InfoRow label="Material" value={materialLabel} />
        <InfoRow label="Was for" value={preferredDateLabel} />
      </Section>

      <Text className="mt-[28px] mb-[24px] text-[15px] leading-[24px] text-text-primary">
        <BrandButton href={portalUrl}>Schedule another pickup</BrandButton>
      </Text>
    </Layout>
  );
}

RequestCancelled.PreviewProps = {
  fullName: 'Sarah Mitchell',
  company: 'Mitchell Manufacturing',
  materialLabel: 'Metal',
  preferredDateLabel: 'Tuesday, March 19, 2026',
  portalUrl: 'https://example.com/portal/request',
};

export default RequestCancelled;
