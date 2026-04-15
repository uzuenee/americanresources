import { Column, Row, Text } from '@react-email/components';

// Two-column label/value row used in pickup detail blocks. Label is small-caps
// muted; value is body-weight primary text.
export function InfoRow({ label, value }) {
  return (
    <Row className="mb-[10px]">
      <Column className="w-[150px] align-top">
        <Text className="m-0 text-[12px] leading-[18px] uppercase tracking-[1.5px] text-text-muted font-semibold">
          {label}
        </Text>
      </Column>
      <Column className="align-top">
        <Text className="m-0 text-[15px] leading-[22px] text-text-primary">
          {value}
        </Text>
      </Column>
    </Row>
  );
}

export default InfoRow;
