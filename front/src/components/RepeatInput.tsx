import { InputLabel } from './InputLabel';
import { NumericInput } from './NumericInput';
import { MAX_OCCURRENCES } from '../const/contracts';
import { useState, useEffect } from 'react';

export function RepeatInput({
  onValueChange,
  occurrences,
  disabled,
}: {
  onValueChange: (repeat: string) => void;
  occurrences: string;
  disabled?: boolean;
}) {
  const [error, setError] = useState('');

  useEffect(() => {
    const numValue = parseInt(occurrences, 10);
    if (!occurrences) {
      setError('');
    } else if (isNaN(numValue)) {
      setError('Please enter a valid number');
    } else if (numValue > MAX_OCCURRENCES) {
      setError(`Maximum occurrences allowed is ${MAX_OCCURRENCES}`);
    } else if (numValue <= 0) {
      setError('Occurrences must be greater than 0');
    } else {
      setError('');
    }
  }, [occurrences]);

  return (
    <>
      <InputLabel label="Repeat" />
      <NumericInput
        placeholder="Enter amount"
        value={occurrences}
        onValueChange={onValueChange}
        disabled={disabled}
        error={error}
      />
    </>
  );
}
