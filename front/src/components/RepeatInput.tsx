import { InputLabel } from './InputLabel';
import { NumericInput } from './NumericInput';

export function RepeatInput({
  onValueChange,
  occurrences,
  disabled,
}: {
  onValueChange: (repeat: string) => void;
  occurrences: string;
  disabled?: boolean;
}) {
  return (
    <>
      <InputLabel label="Repeat" />
      <NumericInput
        placeholder="Enter amount"
        value={occurrences}
        onValueChange={onValueChange}
        disabled={disabled}
      />
    </>
  );
}
