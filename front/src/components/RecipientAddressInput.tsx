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

  return (
    <Input
      error={error}
      value={value}
      onChange={onChange}
      customClass="border-none p-5 mb-0 h-14 focus:ring-1 focus:ring-primary focus:outline-none"
    />
  );
}
