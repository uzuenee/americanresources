import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import { tailwindConfig } from './tailwindConfig';
import { companyInfo } from '@/data/companyInfo';

// Pulls "noreply@…" out of `EMAIL_FROM="American Resources <noreply@…>"`.
// Falls back to the raw header if it has no bracketed address, or to a static
// default so preview (email:dev) doesn't blow up without env.
function parseSenderEmail(header) {
  const raw = typeof header === 'string' ? header : '';
  const match = raw.match(/<([^>]+)>/);
  if (match) return match[1];
  if (raw && raw.includes('@')) return raw;
  return 'noreply@recyclinggroup.com';
}

// Shared shell for every transactional email. Wraps content in a 560px
// container with the brand wordmark on top and company info in the footer.
// Use the `preview` prop to set the inbox preview text (first ~90 chars).
export function Layout({ preview, children }) {
  const senderEmail = parseSenderEmail(process.env.EMAIL_FROM);
  return (
    <Html lang="en">
      <Head>
        {/* Apple Mail / iOS Mail / web clients that respect external CSS will
            load both weights of each family from Google Fonts. Other clients
            fall back to the font stack in tailwindConfig (Helvetica / Georgia). */}
        <Link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600&family=Inter:wght@400;600&display=swap"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Tailwind config={tailwindConfig}>
        <Body className="bg-offwhite font-sans m-0 p-0">
          <Container className="max-w-[560px] mx-auto py-[40px] px-[24px]">
            <Section>
              <Text className="m-0 font-serif text-[24px] leading-[24px] font-semibold text-navy tracking-[1px] uppercase">
                American Resources
              </Text>
              <Text className="m-0 mt-[4px] text-[12px] leading-[16px] uppercase tracking-[2px] text-copper font-semibold">
                {companyInfo.tagline}
              </Text>
            </Section>

            <Hr className="border-0 border-t border-border my-[28px]" />

            <Section>{children}</Section>

            <Hr className="border-0 border-t border-border my-[32px]" />

            <Section>
              <Text className="m-0 text-[13px] leading-[20px] text-text-muted">
                {companyInfo.name}
                <br />
                {companyInfo.address.street}, {companyInfo.address.full}
                <br />
                <Link
                  href={companyInfo.phoneHref}
                  className="text-text-muted underline"
                >
                  {companyInfo.phone}
                </Link>
                {' · '}
                <Link
                  href={`mailto:${companyInfo.email}`}
                  className="text-text-muted underline"
                >
                  {companyInfo.email}
                </Link>
              </Text>
              <Text className="m-0 mt-[12px] text-[12px] leading-[18px] text-text-muted">
                Sent from {senderEmail}. Replies go to our team and we'll get
                back to you within one business day.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default Layout;
