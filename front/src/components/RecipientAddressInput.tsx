import { Input } from '@massalabs/react-ui-kit';
import { useState } from 'react';
import { isValidAddress } from '../utils/address';

interface RecipientAddressInputProps {
  value: string;
  onAddressChange: (address: string) => void;
  error?: string;
}

export function RecipientAddressInput({
  value,
  onAddressChange,
}: RecipientAddressInputProps) {
  const [error, setError] = useState<string>('');
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    onAddressChange(e.target.value);
    setError('');
  }

  function onBlur() {
    if (!value) {
      onAddressChange('');
      return;
    }

    if (!isValidAddress(value)) {
      setError('Invalid address');
    }
  }

  return (
    <Input
      error={error}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      customClass="border-none p-5 mb-0 h-14 focus:ring-1 focus:ring-primary focus:outline-none"
    />
  );
}
