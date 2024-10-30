import useSchedule from '@/hooks/useSchedule';
import { redButton } from '@/styles/buttons';
import { Button, toast } from '@massalabs/react-ui-kit';

export function CreateScheduleButton({ disabled }: { disabled: boolean }) {
  const { createSchedule } = useSchedule();

  const handleCreateSchedule = async () => {
    try {
      createSchedule();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create schedule');
    }
  };

  return (
    <Button
      customClass={redButton}
      onClick={handleCreateSchedule}
      disabled={disabled}
      variant="secondary"
    >
      Create Schedule
    </Button>
  );
}
