import { Input, useAccountStore } from '@massalabs/react-ui-kit';
import { useState } from 'react';
import { isValidAddress } from '../utils/address';
import { InputLabel } from './InputLabel';

interface RecipientAddressInputProps {
  value: string;
  onAddressChange: (address: string) => void;
  disabled?: boolean;
}

export function RecipientAddressInput({
  value,
  onAddressChange,
  disabled,
}: RecipientAddressInputProps) {
  const [error, setError] = useState<string>('');
  const { connectedAccount } = useAccountStore();
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

    if (value === connectedAccount?.address) {
      setError('Spender can not be the same as recipient');
    }
  }

  return (
    <>
      <InputLabel label="Recipient Address" />
      <Input
        error={error}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        customClass="
          border-slate-200 h-14 focus:ring-1 
          focus:ring-primary focus:outline-none 
          disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
      />
    </>
  );
}
