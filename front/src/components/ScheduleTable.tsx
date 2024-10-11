import React, { useState } from 'react';
import { Schedule } from '@/serializable/Schedule';
import { truncateAddress } from '@/utils/address';
import { formatAmount, toast } from '@massalabs/react-ui-kit';
import CheckBox from './CheckBox';
import useSchedule from '@/services/useSchedule';
import { MasToken, supportedTokens } from '../const/assets';
import ScheduleHistory from '@/components/ScheduleHistory';
import { getTokenInfo } from '@/utils/assets';

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
    <tr className="bg-primary text-white">
      {[
        '',
        'ID',
        'OperationId',
        'Mode',
        'Token',
        'Spender',
        'Recipient',
        'Amount',
        'Interval',
        'Occurrences',
        'Remaining',
        'Tolerance',
        'Execution history',
      ].map((header, index) => (
        <th
          key={index}
          className="px-4 py-6 text-left text-xs font-medium uppercase"
        >
          {header}
        </th>
      ))}
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
  const asset =
    supportedTokens.find((token) => token.address === schedule.tokenAddress) ||
    MasToken;
  const formattedAmount = formatAmount(schedule.amount, asset.decimals);
  const isMas = schedule.tokenAddress === '';

  return (
    <tr>
      <td className="text-center px-2 py-4">
        <CheckBox
          isSelected={isSelected}
          onChange={onCheckboxChange}
          id={schedule.id}
        />
      </td>
      <td className="text-center px-2 py-4">{schedule.id.toString()}</td>
      <td className="text-center px-2 py-4">
        <CopyableAddress
          address={schedule.operationId}
          label="Operation ID"
          value={truncateAddress(schedule.operationId)}
        />
      </td>
      <td className="text-center px-2 py-4">
        {schedule.isVesting ? 'Vesting' : 'Tips'}
      </td>
      <td className="text-center px-2 py-4">
        {isMas ? (
          'MAS'
        ) : (
          <CopyableAddress
            label="Token address"
            address={asset.address}
            value={getTokenInfo(asset.address).symbol}
          />
        )}
      </td>
      <td className="text-center px-2 py-4">
        <CopyableAddress
          address={schedule.spender}
          label="Spender address"
          value={truncateAddress(schedule.spender)}
        />
      </td>
      <td className="text-center px-2 py-4">
        <CopyableAddress
          address={schedule.recipient}
          label="Recipient address"
          value={truncateAddress(schedule.recipient)}
        />
      </td>
      <td className="text-center px-2 py-4">
        <span title={formattedAmount.full}>{formattedAmount.preview}</span>
      </td>
      <td className="text-center px-2 py-4">{schedule.interval.toString()}</td>
      <td className="text-center px-2 py-4">
        {schedule.occurrences.toString()}
      </td>
      <td className="text-center px-2 py-4">{schedule.remaining.toString()}</td>
      <td className="text-center px-2 py-4">{schedule.tolerance.toString()}</td>
      <td className="text-center px-2 py-4">
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
