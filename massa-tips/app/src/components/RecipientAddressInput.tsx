import { Input } from '@massalabs/react-ui-kit';

interface RecipientAddressInputProps {
  value: string;
  onAddressChange: (address: string) => void;
  error?: string;
}

export function RecipientAddressInput({
  value,
  onAddressChange,
  error,
}: RecipientAddressInputProps) {
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    onAddressChange(e.target.value);
  }

  return <Input error={error} value={value} onChange={onChange} />;
}
