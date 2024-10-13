import useToken from '@/hooks/useToken';
import { ScheduleInfo } from '@/store/scheduler';
import { commonButton } from '@/styles/buttons';
import { Button, formatAmount } from '@massalabs/react-ui-kit';

export function AllowanceButton({
  scheduleInfo,
  disabled,
}: {
  scheduleInfo: ScheduleInfo;
  disabled: boolean;
}) {
  const { increaseAllowance } = useToken();

  if (disabled) {
    return;
  }

  return (
    <Button
      variant="secondary"
      onClick={() =>
        increaseAllowance(scheduleInfo.amount * scheduleInfo.occurrences)
      }
      customClass={['border-primary text-primary ', ...commonButton].join(' ')}
    >
      {`Allow spending ${
        formatAmount(
          scheduleInfo.amount * scheduleInfo.occurrences,
          scheduleInfo.asset.decimals,
        ).preview
      } ${scheduleInfo.asset.name}`}
    </Button>
  );
}
