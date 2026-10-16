/* eslint-disable max-len */
import React, { useState, useEffect, useMemo } from 'react';
import { truncateAddress } from '@/utils/address';
import { formatAmount, toast, useAccountStore } from '@massalabs/react-ui-kit';
import CheckBox from './CheckBox';
import useSchedule from '@/hooks/useSchedule';
import { MasToken } from '../const/assets';
import ScheduleHistory from '@/components/ScheduleHistory';
import { getRecurrenceFromPeriods } from './Recurrence';
import { useTokenStore } from '@/store/token';
import { ScheduleInstance } from '@/store/scheduler';
import { computeHistoryItems, countPendingTasks } from '@/utils/schedule';

interface ScheduleTableProps {
  schedules: ScheduleInstance[];
  showUserPayments: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
}

const CopyableAddress: React.FC<{
  address: string;
  label: string;
  value: string;
}> = ({ value, address, label }) => (
  <span
    title={address}
    className="
      inline-flex items-center gap-1
      px-2 py-1 rounded-md
      bg-gray-50 hover:bg-primary/10
      text-gray-700 hover:text-primary
      cursor-pointer
      transition-colors duration-150
      font-mono text-xs
    "
    onClick={() => {
      navigator.clipboard.writeText(address);
      toast.success(`${label} copied to clipboard`);
    }}
  >
    {value}
  </span>
);

// Empty State Component
const EmptyState: React.FC<{ message: string; description: string }> = ({
  message,
  description,
}) => (
  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
    <div className="w-20 h-20 mb-5 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center shadow-inner">
      <svg
        className="w-10 h-10 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d={`M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2`}
        />
      </svg>
    </div>
    <p className="text-lg font-medium text-gray-600">{message}</p>
    <p className="text-sm mt-1 text-gray-400 max-w-xs text-center">
      {description}
    </p>
  </div>
);

const TableHeader: React.FC<{ showCheckbox: boolean }> = ({ showCheckbox }) => {
  return (
    <thead className="sticky top-0 z-10">
      <tr className="bg-gradient-to-r from-primary to-primary/90 text-white text-sm">
        {showCheckbox && (
          <th className="font-medium px-4 py-4 w-12 first:rounded-tl-xl"></th>
        )}
        <th className="font-medium hidden xl:table-cell px-4 py-4 text-left">
          Operation ID
        </th>
        <th className="font-medium hidden lg:table-cell px-4 py-4">Mode</th>
        <th className="font-medium px-4 py-4">From</th>
        <th className="font-medium px-4 py-4">To</th>
        <th className="font-medium px-4 py-4">Amount</th>
        <th className="font-medium hidden md:table-cell px-4 py-4">Interval</th>
        <th className="font-medium hidden md:table-cell px-4 py-4">Total</th>
        <th className="font-medium px-4 py-4">Left</th>
        <th
          className={`font-medium hidden px-4 py-4 lg:table-cell ${
            !showCheckbox ? 'last:rounded-tr-xl' : ''
          }`}
        >
          History
        </th>
        {showCheckbox && (
          <th className="font-medium px-4 py-4 w-4 last:rounded-tr-xl"></th>
        )}
      </tr>
    </thead>
  );
};

interface TableRowProps {
  scheduleInstance: ScheduleInstance;
  isSelected: boolean;
  showUserPayments: boolean;
  onCheckboxChange: (
    scheduleInstance: ScheduleInstance,
    checked: boolean,
  ) => void;
  isEven?: boolean;
}

const TableRow: React.FC<TableRowProps> = ({
  scheduleInstance,
  isSelected,
  showUserPayments,
  onCheckboxChange,
  isEven = false,
}) => {
  const { tokens } = useTokenStore();
  const { schedule } = scheduleInstance;
  const asset =
    tokens.find((token) => token.address === schedule.tokenAddress) || MasToken;
  const formattedAmount = formatAmount(schedule.amount, asset.decimals);
  const isMas = schedule.tokenAddress === '';
  const isActive = Number(schedule.remaining) > 0;

  return (
    <tr
      className={`
        transition-colors duration-150 group
        ${isEven ? 'bg-gray-50/30' : 'bg-white'}
        ${isSelected ? 'bg-primary/5' : 'hover:bg-gray-50/80'}
        ${!isActive ? 'opacity-60' : ''}
      `}
    >
      {showUserPayments && (
        <td className="text-center px-4 py-4">
          <CheckBox
            isSelected={isSelected}
            onChange={(checked: boolean) =>
              onCheckboxChange(scheduleInstance, checked)
            }
            id={schedule.id}
          />
        </td>
      )}
      <td className="hidden xl:table-cell px-4 py-4">
        <CopyableAddress
          address={schedule.operationId}
          label="Operation ID"
          value={truncateAddress(schedule.operationId)}
        />
      </td>
      <td className="text-center px-4 py-4 hidden lg:table-cell">
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
            schedule.isVesting
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {schedule.isVesting ? 'Vesting' : 'Tips'}
        </span>
      </td>
      <td className="text-center px-4 py-4">
        <CopyableAddress
          address={schedule.spender}
          label={'Spender'}
          value={truncateAddress(schedule.spender)}
        />
      </td>
      <td className="text-center px-4 py-4">
        <CopyableAddress
          address={schedule.recipient}
          label={'Recipient'}
          value={truncateAddress(schedule.recipient)}
        />
      </td>
      <td className="text-center px-4 py-4">
        <div className="flex items-center justify-center gap-1.5">
          <span
            title={formattedAmount.full}
            className="font-semibold text-gray-800"
          >
            {formattedAmount.preview}
          </span>
          <span className="text-gray-500 text-sm">
            {isMas ? (
              'MAS'
            ) : (
              <CopyableAddress
                label="Token address"
                address={asset.address}
                value={asset.symbol}
              />
            )}
          </span>
        </div>
      </td>
      <td className="text-center px-4 py-4 hidden md:table-cell text-gray-600">
        {getRecurrenceFromPeriods(schedule.interval).unit}
      </td>
      <td className="text-center px-4 py-4 hidden md:table-cell">
        <span className="text-gray-600">{schedule.occurrences.toString()}</span>
      </td>
      <td className="text-center px-4 py-4">
        <div className="flex items-center justify-center gap-1.5">
          <span
            className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-full text-xs font-semibold ${
              isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {schedule.remaining.toString()}
          </span>
        </div>
      </td>
      <td className="text-center hidden lg:table-cell px-4 py-4">
        <ScheduleHistory
          scheduleInstance={scheduleInstance}
          showUserPayments={showUserPayments}
        />
      </td>
      {showUserPayments && <td className="px-2"></td>}
    </tr>
  );
};

const SelectedInfo: React.FC<{ count: number; onCancel: () => void }> = ({
  count,
  onCancel,
}) => (
  <div
    className="
      flex justify-between items-center mb-4 
      p-4 bg-primary/5 border border-primary/20 
      rounded-xl animate-fade-in
    "
  >
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
      <span className="text-sm font-medium text-gray-700">
        {count} schedule{count > 1 ? 's' : ''} selected
      </span>
    </div>
    <button
      className="
        px-5 py-2.5 
        bg-primary hover:bg-primary/90 
        text-white font-medium text-sm
        rounded-lg shadow-sm hover:shadow-md
        transition-all duration-200
        active:scale-95
      "
      onClick={onCancel}
    >
      Cancel Selected
    </button>
  </div>
);

const ScheduleTable: React.FC<ScheduleTableProps> = ({
  schedules,
  showUserPayments,
  emptyMessage = 'No schedules yet',
  emptyDescription = 'Create your first schedule to get started',
}) => {
  const [selected, setSelected] = useState<
    { contractAddress: string; id: bigint }[]
  >([]);
  const { cancelSchedules } = useSchedule();
  const { connectedAccount } = useAccountStore();
  const [currentPeriod, setCurrentPeriod] = useState<bigint | null>(null);

  const handleCheckbox = (
    scheduleInstance: ScheduleInstance,
    checked: boolean,
  ) => {
    const scheduleKey = {
      contractAddress: scheduleInstance.contract,
      id: scheduleInstance.schedule.id,
    };
    setSelected((prevSelected) =>
      checked
        ? [...prevSelected, scheduleKey]
        : prevSelected.filter(
            (item) =>
              !(
                item.contractAddress === scheduleKey.contractAddress &&
                item.id === scheduleKey.id
              ),
          ),
    );
  };

  const handleCancel = async () => {
    try {
      await cancelSchedules(selected);
      setSelected([]);
    } catch (error) {
      toast.error('Failed to cancel schedules');
    }
  };

  // Fetch current period for calculating ready items
  useEffect(() => {
    if (!connectedAccount) return;

    const fetchCurrentPeriod = async () => {
      try {
        const { lastSlot } = await connectedAccount.getNodeStatus();
        if (lastSlot) setCurrentPeriod(BigInt(lastSlot.period));
      } catch (error) {
        console.error('Failed to fetch current period:', error);
      }
    };

    fetchCurrentPeriod();
  }, [connectedAccount]);

  // Count active schedules
  const activeCount = schedules.filter(
    (s) => Number(s.schedule.remaining) > 0,
  ).length;
  const completedCount = schedules.length - activeCount;

  // Calculate occurrences that failed and can be resent manually
  const manualResendCount = useMemo(() => {
    if (!currentPeriod) return 0;

    return schedules.reduce((acc, { schedule }) => {
      const items = computeHistoryItems(schedule, currentPeriod);
      return acc + countPendingTasks(items);
    }, 0);
  }, [schedules, currentPeriod]);

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto">
      {/* Selection bar */}
      {selected.length > 0 && (
        <SelectedInfo count={selected.length} onCancel={handleCancel} />
      )}

      {schedules.length === 0 ? (
        <EmptyState message={emptyMessage} description={emptyDescription} />
      ) : (
        <div className="space-y-4">
          {/* Table info bar */}
          <div className="flex items-center justify-between text-sm text-gray-500 px-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {activeCount} active
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                {completedCount} completed
              </span>
            </div>
            <div className="flex flex-col items-end gap-0.5 text-right">
              <span className="text-gray-400">
                {schedules.length} total schedule
                {schedules.length !== 1 ? 's' : ''}
              </span>
              {manualResendCount > 0 && (
                <span className="text-xs text-amber-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {manualResendCount} occurrences to resend manually
                </span>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-100 bg-white">
            <table className="w-full">
              <TableHeader showCheckbox={showUserPayments} />
              <tbody className="text-sm divide-y divide-gray-100">
                {schedules.map((schedule, index) => (
                  <TableRow
                    key={`${
                      schedule.contract
                    }-${schedule.schedule.id.toString()}`}
                    scheduleInstance={schedule}
                    isSelected={selected.some(
                      (item) =>
                        item.contractAddress === schedule.contract &&
                        item.id === schedule.schedule.id,
                    )}
                    onCheckboxChange={handleCheckbox}
                    showUserPayments={showUserPayments}
                    isEven={index % 2 === 0}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleTable;
