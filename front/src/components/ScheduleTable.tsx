import React, { useState } from 'react';
import { Schedule } from '@/serializable/Schedule';
import { truncateAddress } from '@/utils/address';
import { formatAmount, toast } from '@massalabs/react-ui-kit';
import CheckBox from './CheckBox';
import useSchedule from '@/hooks/useSchedule';
import { MasToken } from '../const/assets';
import ScheduleHistory from '@/components/ScheduleHistory';
import { getRecurrenceFromPeriods } from './Recurrence';
import { useTokenStore } from '@/store/token';

interface ScheduleTableProps {
  schedules: Schedule[];
}

const CopyableAddress: React.FC<{
  address: string;
  label: string;
  value: string;
}> = ({ value, address, label }) => (
  <span
    title={address}
    className="hover:text-blue-500 cursor-pointer"
    onClick={() => {
      navigator.clipboard.writeText(address);
      toast.success(`${label} copied to clipboard`);
    }}
  >
    {value}
  </span>
);

const TableHeader: React.FC = () => (
  <thead>
    <tr className="bg-primary text-white text-sm py-5">
      <th className="font-normal px-4 py-5"></th>
      <th className="font-normal hidden xl:table-cell px-4 py-5">
        OperationId
      </th>
      <th className="font-normal hidden lg:table-cell px-4 py-5">Mode</th>
      <th className="font-normal px-4 py-5">Token</th>
      <th className="font-normal px-4 py-5">Recipient</th>
      <th className="font-normal px-4 py-5">Amount</th>
      <th className="font-normal hidden md:table-cell px-4 py-5">Interval</th>
      <th className="font-normal hidden md:table-cell px-4 py-5">
        Occurrences
      </th>
      <th className="font-normal px-4 py-5">Remaining</th>
      <th className="font-normal hidden px-4 py-5 lg:table-cell">
        Execution history
      </th>
    </tr>
  </thead>
);

interface TableRowProps {
  schedule: Schedule;
  isSelected: boolean;
  onCheckboxChange: (id: bigint, checked: boolean) => void;
}

const TableRow: React.FC<TableRowProps> = ({
  schedule,
  isSelected,
  onCheckboxChange,
}) => {
  const { tokens } = useTokenStore();
  const asset =
    tokens.find((token) => token.address === schedule.tokenAddress) || MasToken;
  const formattedAmount = formatAmount(schedule.amount, asset.decimals);
  const isMas = schedule.tokenAddress === '';
  return (
    <tr>
      <td className=" text-center px-6 py-6">
        <CheckBox
          isSelected={isSelected}
          onChange={onCheckboxChange}
          id={schedule.id}
        />
      </td>
      <td className="text-center hidden xl:table-cell">
        <CopyableAddress
          address={schedule.operationId}
          label="Operation ID"
          value={truncateAddress(schedule.operationId)}
        />
      </td>
      <td className="text-center px-6 py-6 hidden lg:table-cell">
        {schedule.isVesting ? 'Vesting' : 'Tips'}
      </td>
      <td className="text-center ">
        {isMas ? (
          'MAS'
        ) : (
          <CopyableAddress
            label="Token address"
            address={asset.address}
            value={asset.symbol}
          />
        )}
      </td>
      <td className="text-center px-6 py-6">
        <CopyableAddress
          address={schedule.recipient}
          label="Recipient address"
          value={truncateAddress(schedule.recipient)}
        />
      </td>
      <td className="text-center ">
        <span title={formattedAmount.full}>{formattedAmount.preview}</span>
      </td>
      <td className="text-center px-6 py-6 hidden md:table-cell">
        {getRecurrenceFromPeriods(schedule.interval).unit}
      </td>
      <td className="text-center px-6 py-6 hidden md:table-cell">
        {schedule.occurrences.toString()}
      </td>
      <td className="text-center px-6 py-6">{schedule.remaining.toString()}</td>
      <td className="text-center hidden lg:table-cell">
        <ScheduleHistory schedule={schedule} />
      </td>
    </tr>
  );
};

const SelectedInfo: React.FC<{ count: number; onCancel: () => void }> = ({
  count,
  onCancel,
}) => (
  <div className="flex justify-between items-center mb-4">
    <div className="text-sm text-gray-500">{count} selected</div>
    <button
      className="px-4 py-2 bg-primary text-white rounded-lg"
      onClick={onCancel}
    >
      Cancel
    </button>
  </div>
);

const ScheduleTable: React.FC<ScheduleTableProps> = ({ schedules }) => {
  const [selected, setSelected] = useState<bigint[]>([]);
  const { cancelSchedules } = useSchedule();

  const handleCheckbox = (id: bigint, checked: boolean) => {
    setSelected((prevSelected) =>
      checked
        ? [...prevSelected, id]
        : prevSelected.filter((item) => item !== id),
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

  return (
    <div className="p-10">
      {selected.length > 0 && (
        <SelectedInfo count={selected.length} onCancel={handleCancel} />
      )}

      <table className="overflow-hidden rounded-2xl shadow-lg bg-secondary w-full">
        <TableHeader />
        <tbody className="text-sm divide-y divide-zinc-300">
          {schedules.map((schedule) => (
            <TableRow
              key={schedule.id.toString()}
              schedule={schedule}
              isSelected={selected.includes(schedule.id)}
              onCheckboxChange={handleCheckbox}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleTable;
