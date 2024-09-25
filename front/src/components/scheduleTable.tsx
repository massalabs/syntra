import { Schedule } from '@/serializable/Schedule';
import { truncateAddress } from '@/utils/address';
import { formatAmount, toast } from '@massalabs/react-ui-kit';
import React, { useState } from 'react';
import CheckBox from './CheckBox';
import useSchedule from '@/services/useSchedule';
import { MasToken, supportedTokens } from '../const/assets';
import ScheduleHistory from './scheduleHistory';

interface ScheduleTableProps {
  schedules: Schedule[];
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ schedules }) => {
  const [selected, setSelected] = useState<bigint[]>([]);
  const { cancelSchedules } = useSchedule();

  const handleCheckbox = (id: bigint, checked: boolean) => {
    const isSelected = selected.includes(id);

    if (!checked && isSelected) {
      // remove from selected
      setSelected(selected.filter((item) => item !== id));
      return;
    }
    if (checked && !isSelected) {
      // add to selected
      setSelected([...selected, id]);
      return;
    }
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
    <div className=" p-10">
      {selected.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500">
            {selected.length} selected
          </div>
          <button
            className="px-4 py-2 bg-primary text-white rounded-lg"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      )}

      <table className="min-w-full  overflow-hidden rounded-2xl shadow-lg bg-secondary">
        <thead>
          <tr className="bg-primary text-white">
            <th className="px-6 py-6 text-left text-xs font-medium uppercase tracking-wider"></th>
            <th className="px-6 py-6 text-left text-xs font-medium uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-6 text-left text-xs font-medium uppercase tracking-wider">
              OperationId
            </th>
            <th className="px-6 py-6 text-left text-xs font-medium uppercase tracking-wider">
              Mode
            </th>
            <th className="px-6 py-6 text-left text-xs font-medium uppercase tracking-wider">
              Token
            </th>
            <th className="px-6 py-6 text-left text-xs font-medium uppercase tracking-wider">
              Spender
            </th>
            <th className="px-6 py-6 text-left text-xs font-medium uppercase tracking-wider">
              Recipient
            </th>
            <th className="px-6 py-6 text-left text-xs font-medium uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-6 text-left text-xs font-medium uppercase tracking-wider">
              Interval
            </th>
            <th className="px-2 py-6 text-left text-xs font-medium uppercase tracking-wider">
              Occurrences
            </th>
            <th className="px-6 py-6 text-left text-xs font-medium uppercase tracking-wider">
              Remaining
            </th>
            <th className="px-6 py-6 text-left text-xs font-medium uppercase tracking-wider">
              Tolerance
            </th>
            <th className="px-6 py-6 text-left text-xs font-medium uppercase tracking-wider">
              Execution history
            </th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-zinc-300">
          {schedules.map((schedule) => {
            const asset =
              supportedTokens.find(
                (token) => token.address === schedule.tokenAddress,
              ) || MasToken;

            const formatedAmount = formatAmount(
              schedule.amount,
              asset.decimals,
            );

            const isMas = schedule.tokenAddress === '';

            return (
              <tr key={schedule.id.toString()}>
                <td className="px-6 py-4 whitespace-nowrap ">
                  <CheckBox
                    isSelected={selected.includes(schedule.id)}
                    onChange={handleCheckbox}
                    id={schedule.id}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap ">
                  {schedule.id.toString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap ">
                  <span
                    title={schedule.operationId}
                    className="hover:text-blue-500 cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(schedule.operationId);
                      toast.success('Operation ID copied to clipboard');
                    }}
                  >
                    {truncateAddress(schedule.operationId)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap ">
                  {schedule.isVesting ? 'Vesting' : 'Tips'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap ">
                  <span
                    title={isMas ? 'MAS' : schedule.tokenAddress}
                    className={
                      isMas ? '' : 'hover:text-blue-500 cursor-pointer'
                    }
                    onClick={() => {
                      if (isMas) return;
                      navigator.clipboard.writeText(schedule.tokenAddress);
                      toast.success('Token address copied to clipboard');
                    }}
                  >
                    {isMas ? 'MAS' : truncateAddress(schedule.tokenAddress)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap ">
                  <span
                    title={schedule.spender}
                    className="hover:text-blue-500 cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(schedule.spender);
                      toast.success('Spender address copied to clipboard');
                    }}
                  >
                    {truncateAddress(schedule.spender)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap ">
                  <span
                    title={schedule.recipient}
                    className="hover:text-blue-500 cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(schedule.recipient);
                      toast.success('Recipient address copied to clipboard');
                    }}
                  >
                    {truncateAddress(schedule.recipient)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap ">
                  <span title={formatedAmount.full}>
                    {formatedAmount.preview}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap ">
                  {schedule.interval.toString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap ">
                  {schedule.occurrences.toString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap ">
                  {schedule.remaining.toString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap ">
                  {schedule.tolerance.toString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap ">
                  <ScheduleHistory schedule={schedule} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleTable;
