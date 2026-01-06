import useToken from '@/hooks/useToken';
import { ScheduleInfo } from '@/store/scheduler';
import { formatAmount } from '@massalabs/react-ui-kit';
import { FiUnlock } from 'react-icons/fi';

export function AllowanceButton({
  scheduleInfo,
  disabled,
}: {
  scheduleInfo: ScheduleInfo;
  disabled: boolean;
}) {
  const { increaseAllowance } = useToken();

  if (disabled) {
    return null;
  }

  return (
    <button
      onClick={() =>
        increaseAllowance(scheduleInfo.amount * scheduleInfo.occurrences)
      }
      className="
        w-full py-3.5 px-6
        flex items-center justify-center gap-2
        bg-white
        border-2 border-primary
        text-primary font-medium
        rounded-xl
        transition-all duration-200 ease-out
        hover:bg-primary/5 hover:shadow-md
        active:scale-[0.98]
        group
      "
    >
      <FiUnlock 
        size={18} 
        className="transition-transform duration-200 group-hover:scale-110" 
      />
      <span>
        Allow spending{' '}
        <span className="font-semibold">
          {formatAmount(
            scheduleInfo.amount * scheduleInfo.occurrences,
            scheduleInfo.asset.decimals,
          ).preview}
        </span>{' '}
        {scheduleInfo.asset.name}
      </span>
    </button>
  );
}
