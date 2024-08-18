import { Schedule } from '@/serializable/Schedule';
import { truncateAddress } from '@/utils/address';
import { formatAmount } from '@massalabs/react-ui-kit';
import React from 'react';

interface ScheduleTableProps {
  schedules: Schedule[];
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ schedules }) => {
  return (
    <div className=" p-10">
      <table className="min-w-full  overflow-hidden rounded-2xl shadow-lg bg-secondary">
        <thead>
          <tr className="bg-primary text-white">
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
