import useSchedule from '@/hooks/useSchedule';
import { useSchedulerStore } from '@/store/scheduler';
import { toast } from '@massalabs/react-ui-kit';
import { FiSend, FiLoader } from 'react-icons/fi';

export function CreateScheduleButton({ disabled }: { disabled: boolean }) {
  const { createSchedule } = useSchedule();
  const { isCreatingSchedule } = useSchedulerStore();

  const handleCreateSchedule = async () => {
    try {
      await createSchedule();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create schedule');
    }
  };

  const isLoading = isCreatingSchedule;
  const isDisabled = disabled || isLoading;

  return (
    <button
      onClick={handleCreateSchedule}
      disabled={isDisabled}
      className={`
        w-full py-3.5 px-6
        flex items-center justify-center gap-2
        bg-gradient-to-r from-primary to-primary/90
        text-white font-semibold
        rounded-xl
        shadow-md shadow-primary/20
        transition-all duration-200 ease-out
        group
        ${
          isDisabled
            ? 'opacity-70 cursor-not-allowed'
            : 'hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5'
    }
        ${isDisabled ? '' : 'active:translate-y-0 active:shadow-md'}
      `}
    >
      {isLoading ? (
        <>
          <FiLoader size={18} className="animate-spin" />
          <span>Creating schedule...</span>
        </>
      ) : (
        <>
          <FiSend
            size={18}
            className={`transition-transform duration-200 ${
              !isDisabled ? 'group-hover:translate-x-0.5' : ''
            }`}
          />
          <span>Create Schedule</span>
        </>
      )}
    </button>
  );
}
