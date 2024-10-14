import { parseUnits } from '@massalabs/massa-web3';
import { InputMessage, Money } from '@massalabs/react-ui-kit';
import { Asset } from '@massalabs/react-ui-kit/src/lib/token/models/AssetModel';
import { useEffect, useState } from 'react';

type NumericInputProps = {
  value: string;
  placeholder: string;
  onValueChange: (e: string) => void;
  asset?: Asset;
  error?: string;
  disabled?: boolean;
};

export function NumericInput(props: NumericInputProps) {
  let { value, placeholder, asset, onValueChange, error, disabled } = props;

  const [amountError, setAmountError] = useState('');

  useEffect(() => {
    if (asset) {
      const balance = asset.balance ?? 0n;
      if (balance < parseUnits(value.replace(/,/g, ''), asset.decimals)) {
        setAmountError('Insufficient balance');
      } else {
        setAmountError('');
      }
    }
  }, [value, asset]);

  return (
    <div>
      <Money
        customClass={`border-slate-200 focus:ring-1 focus:ring-primary focus:outline-none h-14 ${
          disabled
            ? 'cursor-not-allowed opacity-50 focus:ring-0 pointer-events-none'
            : ''
        }`}
        value={value}
        onValueChange={(o) => onValueChange(o.value)}
        placeholder={placeholder}
        suffix=""
        decimalScale={asset ? asset.decimals : 0}
        error={amountError}
      />
      <InputMessage error={error} />
    </div>
  );
}
