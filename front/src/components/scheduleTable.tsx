import { Schedule } from '@/serializable/Schedule';
import { truncateAddress } from '@/utils/address';
import React from 'react';

interface ScheduleTableProps {
  schedules: Schedule[];
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ schedules }) => {
  return (
    <div className="h-screen p-4">
      <table className="min-w-full divide-y divide-gray-200 overflow-hidden rounded-2xl shadow-xl">
        <thead>
          <tr className="bg-[#ebfdc5]">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Token Address
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Spender
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Recipient
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Interval
            </th>
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Occurrences
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Remaining
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tolerance
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              History
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {schedules.map((schedule) => (
            <tr key={schedule.id.toString()}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {schedule.id.toString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {truncateAddress(schedule.tokenAddress)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {truncateAddress(schedule.spender)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {truncateAddress(schedule.recipient)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {schedule.amount.toString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {schedule.interval.toString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {schedule.occurrences.toString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {schedule.remaining.toString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {schedule.tolerance.toString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
