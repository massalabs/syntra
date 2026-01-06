import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Schedule } from '../serializable/Schedule';
import { useAccountStore } from '@massalabs/react-ui-kit';
import useSchedule from '../hooks/useSchedule';
import { ScheduleInstance } from '@/store/scheduler';
import {
  HistoryItem,
  computeHistoryItems,
  countPendingTasks,
  countProcessedTasks,
  filterVisibleItems,
} from '@/utils/schedule';

interface ScheduleHistoryProps {
  scheduleInstance: ScheduleInstance;
  showUserPayments: boolean;
}

const ScheduleHistory: React.FC<ScheduleHistoryProps> = ({
  scheduleInstance,
  showUserPayments,
}) => {
  const { schedule } = scheduleInstance;
  const { connectedAccount } = useAccountStore();
  const { manualTrigger } = useSchedule();

  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });

  const handleOpenPopover = (e: React.MouseEvent) => {
    const popoverWidth = 320;
    const popoverHeight = 350;
    const padding = 16;

    let x = e.clientX;
    let y = e.clientY;

    // Adjust if would go off-screen right
    if (x + popoverWidth > window.innerWidth - padding) {
      x = window.innerWidth - popoverWidth - padding;
    }

    // Adjust if would go off-screen bottom
    if (y + popoverHeight > window.innerHeight - padding) {
      y = window.innerHeight - popoverHeight - padding;
    }

    // Ensure minimum values
    if (x < padding) x = padding;
    if (y < padding) y = padding;

    setClickPosition({ x, y });
    setIsExpanded(true);
  };

  useEffect(() => {
    if (!connectedAccount) return;

    const fetchHistoryItems = async () => {
      const nodeInfos = await connectedAccount.getNodeStatus();
      const currentPeriod = BigInt(nodeInfos.lastSlot.period);
      const newItems = computeHistoryItems(schedule, currentPeriod);
      setItems(newItems);
    };

    fetchHistoryItems();
  }, [connectedAccount, schedule]);

  const filteredItems = useMemo(() => filterVisibleItems(items), [items]);

  // Stats
  const processedCount = countProcessedTasks(filteredItems);
  const pendingCount = countPendingTasks(filteredItems);
  const totalCount = filteredItems.length;

  if (filteredItems.length === 0) {
    return <span className="text-gray-400 text-xs italic">No history</span>;
  }

  return (
    <>
      {/* Compact collapsed view - just show summary badges */}
      <div className="flex flex-col items-center gap-1.5">
        {/* Expand button */}
        <button
          onClick={handleOpenPopover}
          className="
            text-[10px] text-primary/70 hover:text-primary
            flex items-center gap-0.5
            transition-colors duration-150
          "
        >
          {/* Summary badges */}
          <div className="flex items-center gap-1.5">
            <span
              className="
              inline-flex items-center gap-1 px-2 py-0.5 rounded-full
              text-[10px] font-medium bg-green-100 text-green-700
            "
              title={`${processedCount} processed`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              {processedCount}
            </span>
            {pendingCount > 0 && (
              <span
                className="
                inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                text-[10px] font-medium bg-amber-100 text-amber-700
              "
                title={`${pendingCount} pending`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                {pendingCount}
              </span>
            )}
          </div>
          <span>View details</span>
          <ChevronDownIcon />
        </button>
      </div>

      {/* Portal for the popover - renders outside the table */}
      {isExpanded &&
        createPortal(
          <HistoryPopover
            position={clickPosition}
            processedCount={processedCount}
            pendingCount={pendingCount}
            totalCount={totalCount}
            filteredItems={filteredItems}
            schedule={schedule}
            showUserPayments={showUserPayments}
            manualTrigger={manualTrigger}
            contractAddress={scheduleInstance.contract}
            onClose={() => setIsExpanded(false)}
          />,
          document.body,
        )}
    </>
  );
};

// Separate component for the popover content
interface HistoryPopoverProps {
  position: { x: number; y: number };
  processedCount: number;
  pendingCount: number;
  totalCount: number;
  filteredItems: HistoryItem[];
  schedule: Schedule;
  showUserPayments: boolean;
  manualTrigger: (contractAddress: string, spender: string, id: bigint) => void;
  contractAddress: string;
  onClose: () => void;
}

const HistoryPopover: React.FC<HistoryPopoverProps> = ({
  position,
  processedCount,
  pendingCount,
  totalCount,
  filteredItems,
  schedule,
  showUserPayments,
  manualTrigger,
  contractAddress,
  onClose,
}) => {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9998] bg-black/20" onClick={onClose} />

      {/* Popover content */}
      <div
        className="
          fixed z-[9999]
          w-80 max-h-[80vh]
          bg-white rounded-xl shadow-2xl
          border border-gray-200
          overflow-hidden
        "
        style={{
          top: position.y,
          left: position.x,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h4 className="font-semibold text-sm text-gray-800">History</h4>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-1 text-green-600">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                {processedCount}
              </span>
              {pendingCount > 0 && (
                <span className="flex items-center gap-1 text-amber-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  {pendingCount}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="
              p-1 rounded-md
              text-gray-400 hover:text-gray-600
              hover:bg-gray-100
              transition-colors duration-150
            "
          >
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="max-h-60 overflow-y-auto p-3 custom-scrollbar">
          <div className="grid grid-cols-4 gap-1.5">
            {filteredItems.map((item) => (
              <HistoryItemComponent
                key={item.index}
                item={item}
                schedule={schedule}
                showUserPayments={showUserPayments}
                manualTrigger={manualTrigger}
                contractAddress={contractAddress}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-500 text-center">
          {totalCount} total occurrences
        </div>
      </div>
    </>
  );
};

interface HistoryItemComponentProps {
  item: HistoryItem;
  schedule: Schedule;
  showUserPayments: boolean;
  manualTrigger: (contractAddress: string, spender: string, id: bigint) => void;
  contractAddress: string;
}

const HistoryItemComponent: React.FC<HistoryItemComponentProps> = ({
  item,
  schedule,
  showUserPayments,
  manualTrigger,
  contractAddress,
}) => {
  const baseClasses = `
    rounded-lg p-2 text-[10px]
    border transition-all duration-150
    flex flex-col items-center justify-center
    min-h-[44px]
  `;

  if (item.processed) {
    return (
      <div
        className={`
          ${baseClasses}
          bg-green-50 border-green-200
          hover:border-green-300 hover:shadow-sm
          cursor-default
        `}
        title={`Period: ${item.period?.toString()}\nThread: ${item.thread}`}
      >
        <span className="font-semibold text-green-700">#{item.index + 1}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-0.5"></span>
      </div>
    );
  }

  if (schedule.isVesting || showUserPayments) {
    return (
      <div
        className={`
          ${baseClasses}
          bg-amber-50 border-amber-200
          hover:border-amber-300
        `}
      >
        <span className="font-semibold text-amber-700 mb-0.5">
          #{item.index + 1}
        </span>
        <button
          className="
            text-[8px] font-medium
            text-white
            bg-amber-500 hover:bg-amber-600
            rounded px-1.5 py-0.5
            transition-colors duration-150
            shadow-sm
          "
          onClick={() =>
            manualTrigger(contractAddress, schedule.spender, schedule.id)
          }
        >
          Process
        </button>
      </div>
    );
  }

  return (
    <div
      className={`
        ${baseClasses}
        bg-gray-50 border-gray-200
        opacity-50
      `}
    >
      <span className="font-medium text-gray-500">#{item.index + 1}</span>
      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-0.5"></span>
    </div>
  );
};

// Icons
const ChevronDownIcon = () => (
  <svg
    className="w-3 h-3"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const CloseIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export default ScheduleHistory;
