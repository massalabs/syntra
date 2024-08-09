import { useEffect, useRef, useState } from 'react';
import { Dropdown } from '@massalabs/react-ui-kit';
import Intl from '@/i18n/i18n';
import { NumericInput } from './NumericInput';
import { InputLabel } from './InputLabel';

const periodInMilliseconds = 16 * 1000; // 16 seconds

const recurrenceUnits = [
  { name: Intl.t('recurrence.minute'), milliseconds: 60 * 1000 },
  { name: Intl.t('recurrence.hour'), milliseconds: 60 * 60 * 1000 },
  { name: Intl.t('recurrence.day'), milliseconds: 24 * 60 * 60 * 1000 },
  { name: Intl.t('recurrence.week'), milliseconds: 7 * 24 * 60 * 60 * 1000 },
  { name: Intl.t('recurrence.month'), milliseconds: 30 * 24 * 60 * 60 * 1000 },
  { name: Intl.t('recurrence.year'), milliseconds: 365 * 24 * 60 * 60 * 1000 },
];

export function Recurrence({
  onRecurrenceChange,
}: {
  onRecurrenceChange: (value: bigint) => void;
}) {
  const [unitIndex, setUnitIndex] = useState(0);
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
          onNumChange={handleNumUnitsChange}
        />
      </div>
      <div className="col-span-3">
        <InputLabel label="Unit" />
        <Dropdown
          select={unitIndex}
          options={recurrenceUnits.map((unit, index) => ({
            item: unit.name,
            onClick: () => handleUnitChange(index),
          }))}
        />
      </div>
    </div>
  );
}
