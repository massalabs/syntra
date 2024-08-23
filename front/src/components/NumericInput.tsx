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
};

// TODO: To add in ui-kit
export function NumericInput(props: NumericInputProps) {
  const { value, placeholder, asset, onValueChange, error } = props;

  const [amountError, setAmountError] = useState('');

  useEffect(() => {
    if (asset) {
      console.log(asset.balance);
      const balance = asset.balance ?? 0n;
      if (balance < parseUnits(value, asset.decimals)) {
        setAmountError('Insufficient balance');
      } else {
        setAmountError('');
      }
    }
  }, [value, asset]);

  return (
    <div>
      <Money
        customClass="border-none focus:ring-1 focus:ring-primary focus:outline-none"
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
