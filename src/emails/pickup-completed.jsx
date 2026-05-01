import { Heading, Section, Text } from '@react-email/components';
import { Layout } from './_components/Layout';
import { BrandButton } from './_components/BrandButton';
import { InfoRow } from './_components/InfoRow';

export function PickupCompleted({
  fullName,
  company,
  materialLabel,
  weightLbs,
  entryDateLabel,
  historyUrl,
}) {
  const greeting = fullName ? `Hi ${fullName.split(' ')[0]},` : 'Hi there,';
  return (
    <Layout preview={`Pickup complete — ${weightLbs} lbs ${materialLabel} logged.`}>
      <Text className="m-0 text-[12px] leading-[18px] uppercase tracking-[2px] text-success font-semibold">
        Pickup complete
      </Text>
      <Heading
        as="h1"
        className="mt-[8px] mb-0 font-serif text-[30px] leading-[36px] font-semibold text-text-primary"
      >
        {weightLbs} lbs of {materialLabel.toLowerCase()} logged.
      </Heading>

      <Text className="mt-[16px] mb-0 text-[15px] leading-[24px] text-text-primary">
        {greeting}
      </Text>

      <Text className="mt-[12px] mb-[24px] text-[15px] leading-[24px] text-text-primary">
        We picked up your load for <strong>{company}</strong>. The weight is on
        your account and shows up in your reporting.
      </Text>

      <Section className="bg-offwhite-alt rounded-[6px] p-[20px] mt-[8px]">
        <InfoRow label="Material" value={materialLabel} />
        <InfoRow label="Weight" value={`${weightLbs} lbs`} />
        <InfoRow label="Picked up" value={entryDateLabel} />
      </Section>

      <Text className="mt-[28px] mb-[24px] text-[15px] leading-[24px] text-text-primary">
        <BrandButton variant="secondary" href={historyUrl}>
          See your history
        </BrandButton>
      </Text>

      <Text className="mt-[20px] mb-0 text-[13px] leading-[20px] text-text-muted">
        Spotting something off in the weight or material? Reply and we&apos;ll fix
        it.
      </Text>
    </Layout>
  );
}

PickupCompleted.PreviewProps = {
  fullName: 'Sarah Mitchell',
  company: 'Mitchell Manufacturing',
  materialLabel: 'Metal',
  weightLbs: 1240,
  entryDateLabel: 'Tuesday, March 19, 2026',
  historyUrl: 'https://example.com/portal/history',
};

export default PickupCompleted;
