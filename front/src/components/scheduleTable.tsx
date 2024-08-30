import { Schedule } from '@/serializable/Schedule';
import { truncateAddress } from '@/utils/address';
import { formatAmount, toast } from '@massalabs/react-ui-kit';
import React, { useState } from 'react';
import CheckBox from './CheckBox';
import useSchedule from '@/services/useSchedule';

interface ScheduleTableProps {
  schedules: Schedule[];
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ schedules }) => {
  const [selected, setSelected] = useState<bigint[]>([]);
  const { cancelSchedules } = useSchedule();

  const handleSelect = (id: bigint) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
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
              Token Address
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
              History
            </th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-zinc-300">
          {schedules.map((schedule) => (
            <tr key={schedule.id.toString()}>
              <td className="px-6 py-4 whitespace-nowrap ">
                <CheckBox
                  isSelected={selected.includes(schedule.id)}
                  onSelect={handleSelect}
                  id={schedule.id}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap ">
                {schedule.id.toString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap ">
                {truncateAddress(schedule.tokenAddress)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap ">
                {truncateAddress(schedule.spender)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap ">
                {truncateAddress(schedule.recipient)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap ">
                {formatAmount(schedule.amount, 18).preview}
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
                {schedule.history.map((h, index) => (
                  <div key={index}>
                    Period: {h.period.toString()}, Thread: {h.thread.toString()}
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleTable;
