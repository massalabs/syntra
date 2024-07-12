import { Dropdown, IOption } from '@massalabs/react-ui-kit';
import Intl from '../i18n/i18n';

const recurrenceOptions = [
  {
    name: Intl.t('recurrence.day'),
  },
  {
    name: Intl.t('recurrence.week'),
  },
  {
    name: Intl.t('recurrence.month'),
  },
  {
    name: Intl.t('recurrence.year'),
  },
];

export function RecurrenceDropdown({
  onRecurrenceChange,
}: {
  value: IOption;
  onRecurrenceChange: (value: string) => void;
}) {
  const options = () => {
    return recurrenceOptions.map((option) => ({
      item: `${Intl.t('recurrence.every')} ${option.name}`,
      onClick: () => onRecurrenceChange(option.name),
    }));
  };

  return <Dropdown select={0} options={options()} />;
}
