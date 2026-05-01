import { Heading, Text } from '@react-email/components';
import { Layout } from './_components/Layout';
import { BrandButton } from './_components/BrandButton';

export function CustomerApproved({ fullName, company, portalUrl }) {
  const greeting = fullName ? `Hi ${fullName.split(' ')[0]},` : 'Hi there,';
  return (
    <Layout preview="Your account has been approved — you're all set to sign in.">
      <Text className="m-0 text-[12px] leading-[18px] uppercase tracking-[2px] text-success font-semibold">
        Account approved
      </Text>
      <Heading
        as="h1"
        className="mt-[8px] mb-0 font-serif text-[30px] leading-[36px] font-semibold text-text-primary"
      >
        Your account is ready.
      </Heading>

      <Text className="mt-[16px] mb-0 text-[15px] leading-[24px] text-text-primary">
        {greeting}
      </Text>

      <Text className="mt-[12px] mb-0 text-[15px] leading-[24px] text-text-primary">
        Your <strong>{company}</strong> account has been reviewed and approved.
        You can now sign in to schedule pickups, track your loads, and access
        your reporting dashboard.
      </Text>

      <Text className="mt-[28px] mb-[24px] text-[15px] leading-[24px] text-text-primary">
        <BrandButton href={portalUrl}>Go to your portal</BrandButton>
      </Text>

      <Text className="mt-[20px] mb-0 text-[13px] leading-[20px] text-text-muted">
        Questions about your account? Reply to this email and our team will
        help.
      </Text>
    </Layout>
  );
}

CustomerApproved.PreviewProps = {
  fullName: 'Sarah Mitchell',
  company: 'Mitchell Manufacturing',
  portalUrl: 'https://example.com/portal/dashboard',
};

export default CustomerApproved;
