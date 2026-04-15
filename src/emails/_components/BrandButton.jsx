import { Button } from '@react-email/components';

// Brand-consistent CTA. `primary` uses accent red (highest signal — confirm,
// reset). `secondary` uses navy (utility — view dashboard, schedule again).
export function BrandButton({ href, children, variant = 'primary' }) {
  const palette =
    variant === 'primary'
      ? 'bg-accent text-white'
      : variant === 'copper'
        ? 'bg-copper text-navy-dark'
        : 'bg-navy text-white';

  return (
    <Button
      href={href}
      className={`${palette} font-sans font-semibold text-[15px] leading-[15px] px-[28px] py-[14px] rounded-[4px] no-underline inline-block tracking-[0.2px]`}
    >
      {children}
    </Button>
  );
}

export default BrandButton;
