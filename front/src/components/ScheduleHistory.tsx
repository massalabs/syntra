import React, { useEffect, useState, useMemo } from 'react';
import { Schedule } from '../serializable/Schedule';
import { useAccountStore } from '@massalabs/react-ui-kit';
import useSchedule from '../hooks/useSchedule';
import { useSchedulerStore } from '@/store/scheduler';

interface ScheduleHistoryProps {
  schedule: Schedule;
}

type HistoryItem = {
  period?: bigint;
  thread?: number;
  index: number;
  processed: boolean;
  isReady: boolean;
};

const ScheduleHistory: React.FC<ScheduleHistoryProps> = ({ schedule }) => {
  const { connectedAccount } = useAccountStore();
  const { manualTrigger } = useSchedule();
  const { showUserPayments } = useSchedulerStore();

  const [items, setItems] = useState<HistoryItem[]>([]);

  const startPeriod = useMemo(() => schedule.history[0]?.period, [schedule]);

  useEffect(() => {
    if (!connectedAccount || !startPeriod) return;

    const fetchHistoryItems = async () => {
      const nodeInfos = await connectedAccount.getNodeStatus();
      const currentPeriod = BigInt(nodeInfos.lastSlot.period);

      const newItems: HistoryItem[] = Array.from(
        { length: Number(schedule.occurrences) },
        (_, taskIndex) => {
          const task = schedule.history.find(
            (h) => h.taskIndex === BigInt(taskIndex),
          );
          const expectedPeriod =
            startPeriod +
            BigInt(taskIndex) * schedule.interval +
            schedule.tolerance;
          const isReady = !!currentPeriod && currentPeriod > expectedPeriod;

          return {
            period: task?.period,
            thread: task?.thread,
            index: taskIndex,
            processed: !!task,
            isReady,
          };
        },
      );

      setItems(newItems);
    };

    fetchHistoryItems();
  }, [connectedAccount, schedule, startPeriod]);

  const filteredItems = useMemo(
    () => items.filter((item) => item.processed || item.isReady),
    [items],
  );

  return (
    <div className="flex flex-col gap-2">
      {filteredItems.map((item) => (
        <HistoryItemComponent
          key={item.index}
          item={item}
          schedule={schedule}
          showUserPayments={showUserPayments}
          manualTrigger={manualTrigger}
        />
      ))}
    </div>
  );
};

interface HistoryItemComponentProps {
  item: HistoryItem;
  schedule: Schedule;
  showUserPayments: boolean;
  manualTrigger: (spender: string, id: bigint) => void;
}

const HistoryItemComponent: React.FC<HistoryItemComponentProps> = ({
  item,
  schedule,
  showUserPayments,
  manualTrigger,
}) => {
  if (item.processed) {
    return (
      <p>
        {`${item.index + 1}: `}
        <span title={`Thread: ${item.thread?.toString()}`}>
          {`Period: ${item.period?.toString()}`}
        </span>
      </p>
    );
  }

  if (showUserPayments) {
    return (
      <p>
        {`${item.index + 1}: `}
        <button
          className="text-primary border-primary border-2 px-2 py-1 my-1 rounded-lg"
          onClick={() => manualTrigger(schedule.spender, schedule.id)}
        >
          Process task
        </button>
      </p>
    );
  }

  return (
    <p>
      {`${item.index + 1}: `}
      <span title={`Thread: ${item.thread?.toString()}`}>Not processed</span>
    </p>
  );
};

export default ScheduleHistory;
