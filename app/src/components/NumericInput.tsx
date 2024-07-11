import { InputMessage } from '@massalabs/react-ui-kit';
import { NumericFormat } from 'react-number-format';

type NumericInputProps = {
  value: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
};
export function NumericInput(props: NumericInputProps) {
  const { value, placeholder, onChange, error } = props;

  return (
    <div>
      <NumericFormat
        className={`default-input w-full h-full pl-3 pr-10 border-none focus:ring-2`}
        decimalScale={0}
        allowNegative={false}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <InputMessage error={error} />
    </div>
  );
}
