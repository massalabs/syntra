import { Dropdown } from '@massalabs/react-ui-kit';
import Intl from '../i18n/i18n';

const recurrenceOptions = [
  {
    name: Intl.t('recurrence.day'),
    value: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  },
  {
    name: Intl.t('recurrence.week'),
    value: 7 * 24 * 60 * 60 * 1000, // 1 week in milliseconds
  },
  {
    name: Intl.t('recurrence.month'),
    value: 30 * 24 * 60 * 60 * 1000, // Approx. 1 month in milliseconds
  },
  {
    name: Intl.t('recurrence.year'),
    value: 365 * 24 * 60 * 60 * 1000, // 1 year in milliseconds
  },
];

export function RecurrenceDropdown({
  value,
  onRecurrenceChange,
}: {
  value: number;
  onRecurrenceChange: (value: number) => void;
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
