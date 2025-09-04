import { useSchedulerStore } from '@/store/scheduler';
import { redButton } from '@/styles/buttons';
import { Button } from '@massalabs/react-ui-kit';
import ScheduleTable from './ScheduleTable';
import { useState } from 'react';

export function ScheduleTablesSection() {
  const { userPayments, userReceive } = useSchedulerStore();

  const [showUserPayments, setShowUserPayments] = useState(true);

  const schedules = showUserPayments ? userPayments : userReceive;

  return (
    <div className="flex flex-col w-full">
      <div className="flex w-full justify-center mt-12">
        <SwitchTableButton
          isActive={showUserPayments}
          onClick={() => setShowUserPayments(true)}
          label="Payed"
          className="rounded-r-none"
        />
        <SwitchTableButton
          isActive={!showUserPayments}
          onClick={() => setShowUserPayments(false)}
          label="Received"
          className="rounded-l-none"
        />
      </div>

      <div className={`min-w-full `}>
        <ScheduleTable
          schedules={schedules}
          showUserPayments={showUserPayments}
        />
      </div>
    </div>
  );
}

interface SwitchTableButtonProps {
  isActive: boolean;
  onClick: () => void;
  label: string;
  className?: string;
}

const SwitchTableButton: React.FC<SwitchTableButtonProps> = ({
  isActive,
  onClick,
  label,
  className,
}) => {
  return (
    <Button
      className={`${
        isActive ? redButton : 'bg-gray-400'
      } w-96 hover:bg-opacity-100 hover:shadow-none ${className}`}
      onClick={onClick}
    >
      {label}
    </Button>
  );
};
