import { Heading, Link, Text } from '@react-email/components';
import { Layout } from './_components/Layout';
import { BrandButton } from './_components/BrandButton';

export function EmailConfirmation({
  fullName,
  company,
  confirmUrl,
}) {
  const greeting = fullName ? `Hi ${fullName.split(' ')[0]},` : 'Hi there,';
  return (
    <Layout preview="Confirm your American Resources account to start scheduling pickups.">
      <Heading
        as="h1"
        className="m-0 font-serif text-[30px] leading-[36px] font-semibold text-text-primary"
      >
        Welcome to American Resources.
      </Heading>

      <Text className="mt-[16px] mb-0 text-[15px] leading-[24px] text-text-primary">
        {greeting}
      </Text>

      <Text className="mt-[12px] mb-0 text-[15px] leading-[24px] text-text-primary">
        Your account for <strong>{company}</strong> is set up. Confirm your
        email so we can verify it&apos;s really you, and you&apos;ll be ready to schedule
        your first pickup.
      </Text>

      <Text className="mt-[28px] mb-[24px] text-[15px] leading-[24px] text-text-primary">
        <BrandButton href={confirmUrl}>Confirm your account</BrandButton>
      </Text>

      <Text className="mt-[24px] mb-0 text-[13px] leading-[20px] text-text-muted">
        Or paste this link into your browser:
        <br />
        <Link href={confirmUrl} className="text-navy-light break-all">
          {confirmUrl}
        </Link>
      </Text>

      <Text className="mt-[28px] mb-0 text-[13px] leading-[20px] text-text-muted">
        This link expires in 24 hours. If you didn&apos;t create an account, you can
        safely ignore this email.
      </Text>
    </Layout>
  );
}

EmailConfirmation.PreviewProps = {
  fullName: 'Sarah Mitchell',
  company: 'Mitchell Manufacturing',
  confirmUrl: 'https://example.com/auth/callback?token_hash=demo&type=signup',
};

export default EmailConfirmation;
