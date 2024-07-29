import { Dropdown } from '@massalabs/react-ui-kit';
import Intl from '@/i18n/i18n';

// Define a period in milliseconds
const periodInMilliseconds = 16 * 1000; // 16 seconds

const recurrenceOptions = [
  {
    name: Intl.t('recurrence.minute'),
    // TODO: Fix this, not accurate, it's not 1 minute.
    // To be more accurate we could select the number of periods then display the time in human readable format
    value: BigInt(Math.ceil((60 * 1000) / periodInMilliseconds)), // 1 minute in periods
  },
  {
    name: Intl.t('recurrence.hour'),
    value: BigInt(Math.ceil((60 * 60 * 1000) / periodInMilliseconds)), // 1 hour in periods
  },
  {
    name: Intl.t('recurrence.day'),
    value: BigInt(Math.ceil((24 * 60 * 60 * 1000) / periodInMilliseconds)), // 1 day in periods
  },
  {
    name: Intl.t('recurrence.week'),
    value: BigInt(Math.ceil((7 * 24 * 60 * 60 * 1000) / periodInMilliseconds)), // 1 week in periods
  },
  {
    name: Intl.t('recurrence.month'),
    value: BigInt(Math.ceil((30 * 24 * 60 * 60 * 1000) / periodInMilliseconds)), // Approx. 1 month in periods
  },
  {
    name: Intl.t('recurrence.year'),
    value: BigInt(
      Math.ceil((365 * 24 * 60 * 60 * 1000) / periodInMilliseconds),
    ), // 1 year in periods
  },
];

export function RecurrenceDropdown({
  value,
  onRecurrenceChange,
}: {
  value: bigint;
  onRecurrenceChange: (value: bigint) => void;
}) {
  const selectedIndex = recurrenceOptions.findIndex(
    (option) => option.value === value,
  );
  const select = selectedIndex >= 0 ? selectedIndex : 0;
  const options = () => {
    return recurrenceOptions.map((option) => ({
      item: `${Intl.t('recurrence.every')} ${option.name}`,
      onClick: () => onRecurrenceChange(option.value),
    }));
  };

  return <Dropdown select={select} options={options()} />;
}
