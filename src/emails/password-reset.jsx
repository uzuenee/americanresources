import { Heading, Link, Text } from '@react-email/components';
import { Layout } from './_components/Layout';
import { BrandButton } from './_components/BrandButton';

export function PasswordReset({ fullName, resetUrl }) {
  const greeting = fullName ? `Hi ${fullName.split(' ')[0]},` : 'Hi there,';
  return (
    <Layout preview="Reset your American Resources password.">
      <Heading
        as="h1"
        className="m-0 font-serif text-[30px] leading-[36px] font-semibold text-text-primary"
      >
        Reset your password.
      </Heading>

      <Text className="mt-[16px] mb-0 text-[15px] leading-[24px] text-text-primary">
        {greeting}
      </Text>

      <Text className="mt-[12px] mb-0 text-[15px] leading-[24px] text-text-primary">
        We got a request to reset the password on your American Resources
        account. Click below to choose a new one.
      </Text>

      <Text className="mt-[28px] mb-[24px] text-[15px] leading-[24px] text-text-primary">
        <BrandButton href={resetUrl}>Choose a new password</BrandButton>
      </Text>

      <Text className="mt-[24px] mb-0 text-[13px] leading-[20px] text-text-muted">
        Or paste this link into your browser:
        <br />
        <Link href={resetUrl} className="text-navy-light break-all">
          {resetUrl}
        </Link>
      </Text>

      <Text className="mt-[28px] mb-0 text-[13px] leading-[20px] text-text-muted">
        This link expires in one hour. If you didn't request a password reset,
        you can safely ignore this email — your password won't change.
      </Text>
    </Layout>
  );
}

PasswordReset.PreviewProps = {
  fullName: 'Sarah Mitchell',
  resetUrl: 'https://example.com/auth/callback?token_hash=demo&type=recovery',
};

export default PasswordReset;
