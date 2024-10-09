import { InputLabel } from './InputLabel';
import { NumericInput } from './NumericInput';

export function RepeatInput({
  onValueChange,
  occurrences,
}: {
  onValueChange: (repeat: string) => void;
  occurrences: string;
}) {
  return (
    <>
      <InputLabel label="Repeat" />
      <NumericInput
        placeholder="Enter amount"
        value={occurrences}
        onValueChange={onValueChange}
      />
    </>
  );
}
