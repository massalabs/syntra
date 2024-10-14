import React, { useEffect, useState } from 'react';
import { Schedule } from '../serializable/Schedule';
import { useAccountStore } from '@massalabs/react-ui-kit';
import useSchedule from '../hooks/useSchedule';

interface ScheduleHistoryProps {
  schedule: Schedule;
}

interface HistoryItem {
  period?: bigint;
  thread?: number;
  index: number;
  processed: boolean;
  isReady: boolean;
}

const ScheduleHistory: React.FC<ScheduleHistoryProps> = ({ schedule }) => {
  const { connectedAccount } = useAccountStore();
  const { manualTrigger } = useSchedule();
  const [items, setItems] = useState<HistoryItem[]>();

  useEffect(() => {
    if (!connectedAccount) {
      return;
    }
    const startPeriod = schedule.history[0].period;

    connectedAccount.getNodeStatus().then((nodeInfos) => {
      const currentPeriod = BigInt(nodeInfos.lastSlot.period);

      let items: HistoryItem[] = [];
      for (
        let taskIndex = 0;
        taskIndex < Number(schedule.occurrences);
        taskIndex++
      ) {
        const task = schedule.history.find(
          (h) => h.taskIndex === BigInt(taskIndex),
        );
        const expectedPeriod =
          startPeriod +
          BigInt(taskIndex) * schedule.interval +
          schedule.tolerance;
        const isReady = !!currentPeriod && currentPeriod > expectedPeriod;

        items[taskIndex] = {
          period: task?.period,
          thread: task?.thread,
          index: taskIndex,
          processed: !!task,
          isReady,
        };
        if (!isReady) {
          break;
        }
      }
      setItems(items);
    });
  }, [connectedAccount, schedule]);

  return (
    <div>
      {items?.length &&
        items
          .filter((item) => item.processed || item.isReady)
          .sort((a, b) => a.index - b.index)
          .map((item) => (
            <p key={item.index}>
              {`${item.index + 1}: `}
              {item.processed ? (
                <span title={`Thread: ${item.thread?.toString()}`}>
                  {`Period: ${item.period?.toString()}`}
                </span>
              ) : (
                <button
                  className="text-primary border-primary border-2 px-2 py-1 my-1 rounded-lg"
                  onClick={() => manualTrigger(schedule.spender, schedule.id)}
                >
                  Process task
                </button>
              )}
            </p>
          ))}
    </div>
  );
};

export default ScheduleHistory;
