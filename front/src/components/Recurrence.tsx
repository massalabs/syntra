import { useEffect, useRef, useState } from 'react';
import { Dropdown } from '@massalabs/react-ui-kit';
import Intl from '@/i18n/i18n';
import { InputLabel } from './InputLabel';
import { NumericInput } from './NumericInput';

const periodInMilliseconds = 16 * 1000; // 16 seconds

const recurrenceUnits = [
  { name: Intl.t('recurrence.minute'), milliseconds: 60 * 1000, periods: 225 },
  {
    name: Intl.t('recurrence.hour'),
    milliseconds: 60 * 60 * 1000,
    periods: 225,
  },
  {
    name: Intl.t('recurrence.day'),
    milliseconds: 24 * 60 * 60 * 1000,
    periods: 5400,
  },
  {
    name: Intl.t('recurrence.week'),
    milliseconds: 7 * 24 * 60 * 60 * 1000,
    periods: 37800,
  },
  {
    name: Intl.t('recurrence.month'),
    milliseconds: 30 * 24 * 60 * 60 * 1000,
    periods: 162000,
  },
  {
    name: Intl.t('recurrence.year'),
    milliseconds: 365 * 24 * 60 * 60 * 1000,
    periods: 1971000,
  },
];

export function getRecurrenceFromPeriods(periods: bigint) {
  const totalMilliseconds = BigInt(periods) * BigInt(periodInMilliseconds);

  // Iterate from largest to smallest unit
  for (let i = recurrenceUnits.length - 1; i >= 0; i--) {
    const unit = recurrenceUnits[i];
    const unitMilliseconds = BigInt(unit.milliseconds);

    if (totalMilliseconds >= unitMilliseconds) {
      const numUnits = Number(totalMilliseconds / unitMilliseconds);
      return { unit: unit.name, value: numUnits };
    }
  }

  // Fallback to the smallest unit (should rarely happen with given units)
  const smallestUnit = recurrenceUnits[0];
  return {
    unit: smallestUnit.name,
    value: Number(totalMilliseconds / BigInt(smallestUnit.milliseconds)),
  };
}

export function Recurrence({
  onRecurrenceChange,
  disabled,
}: {
  onRecurrenceChange: (value: bigint) => void;
  disabled?: boolean;
}) {
  const [unitIndex, setUnitIndex] = useState(4);
  const [numUnits, setNumUnits] = useState(1);

  const selectedUnit = recurrenceUnits[unitIndex];
  const periods = BigInt(
    Math.ceil((numUnits * selectedUnit.milliseconds) / periodInMilliseconds),
  );

  const refPeriods = useRef(periods);

  useEffect(() => {
    if (refPeriods.current !== periods) {
      onRecurrenceChange(periods);
      refPeriods.current = periods;
    }
  }, [periods, onRecurrenceChange]);

  const handleUnitChange = (index: number) => {
    setUnitIndex(index);
    onRecurrenceChange(periods);
  };

  const handleNumUnitsChange = (value: string) => {
    const newNumUnits = parseInt(value, 10);
    if (!isNaN(newNumUnits)) {
      setNumUnits(newNumUnits);
      onRecurrenceChange(periods);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      <div className="col-span-1">
        <InputLabel label="Every" />
        <NumericInput
          value={numUnits.toString()}
          placeholder={'0'}
          onValueChange={handleNumUnitsChange}
          disabled={disabled}
        />
      </div>
      <div className="col-span-3">
        <InputLabel label="Unit" />
        <div
          className={
            disabled
              ? 'filter grayscale opacity-50 cursor-not-allowed pointer-events-none'
              : ''
          }
        >
          <Dropdown
            select={unitIndex}
            options={recurrenceUnits.map((unit, index) => ({
              item: unit.name,
              onClick: () => handleUnitChange(index),
            }))}
          />
        </div>
      </div>
    </div>
  );
}
