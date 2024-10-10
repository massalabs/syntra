import { InputLabel } from './InputLabel';
import { NumericInput } from './NumericInput';
import { ScheduleInfo } from '@/store/scheduler';
import { formatAmount } from '@massalabs/react-ui-kit';

type SelectAmountProps = {
  onValueChange: (amount: string) => void;
  scheduleInfo: ScheduleInfo;
  disabled: boolean;
};

export function SelectAmount({
  scheduleInfo,
  onValueChange,
  disabled,
}: SelectAmountProps) {
  return (
    <>
      <InputLabel label={'Amount'} />
      <NumericInput
        placeholder="Enter your amount"
        onValueChange={(amount: string) => {
          onValueChange(amount);
        }}
        asset={scheduleInfo.asset}
        value={
          formatAmount(scheduleInfo.amount, scheduleInfo.asset.decimals).full
        }
        disabled={disabled}
      />
    </>
  );
}
