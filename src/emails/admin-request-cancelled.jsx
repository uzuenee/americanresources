import { Heading, Section, Text } from '@react-email/components';
import { Layout } from './_components/Layout';
import { InfoRow } from './_components/InfoRow';

export function AdminRequestCancelled({
  company,
  materialLabel,
  preferredDateLabel,
  cancelledBy,
}) {
  return (
    <Layout preview={`Request cancelled: ${company} — ${materialLabel}`}>
      <Text className="m-0 text-[12px] leading-[18px] uppercase tracking-[2px] text-accent font-semibold">
        Request cancelled
      </Text>
      <Heading
        as="h1"
        className="mt-[8px] mb-0 font-serif text-[26px] leading-[32px] font-semibold text-text-primary"
      >
        {company}
      </Heading>

      <Section className="bg-offwhite-alt rounded-[6px] p-[20px] mt-[24px]">
        <InfoRow label="Material" value={materialLabel} />
        <InfoRow label="Was for" value={preferredDateLabel} />
        <InfoRow label="Cancelled by" value={cancelledBy} />
      </Section>
    </Layout>
  );
}

AdminRequestCancelled.PreviewProps = {
  company: 'Mitchell Manufacturing',
  materialLabel: 'Metal',
  preferredDateLabel: 'Tuesday, March 19, 2026',
  cancelledBy: 'Mike Reynolds',
};

export default AdminRequestCancelled;
