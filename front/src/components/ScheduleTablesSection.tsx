import { useSchedulerStore, ScheduleInstance } from '@/store/scheduler';
import ScheduleTable from './ScheduleTable';
import { useState } from 'react';
import {
  FiArrowUpRight,
  FiArrowDownLeft,
  FiCalendar,
  FiLoader,
} from 'react-icons/fi';
import { useAccountStore } from '@massalabs/react-ui-kit';

type TabType = 'sent' | 'received';

export function ScheduleTablesSection() {
  const { userPayments, userReceive, isLoadingSchedules } = useSchedulerStore();
  const { connectedAccount } = useAccountStore();
  const [activeTab, setActiveTab] = useState<TabType>('sent');

  if (!connectedAccount) {
    return (
      <div className="flex flex-col w-full bg-gradient-to-b from-white to-gray-50 min-h-screen">
        <div className="flex flex-col items-center justify-center py-24 px-4">
          <div className="w-20 h-20 mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <FiCalendar className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            Connect your wallet to view and manage your scheduled transfers
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-gradient-to-b from-white to-gray-50 min-h-screen">
      {/* Section Header */}
      <div className="pt-12 pb-4 px-6 sm:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 font-Urbane">
              Your Schedules
            </h2>
            <p className="text-gray-500 mt-1">
              View and manage your scheduled transfers
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center sm:justify-start">
            <div
              className="inline-flex bg-gray-100/80 backdrop-blur-sm p-1.5
                rounded-xl shadow-inner border border-gray-200/50"
            >
              <TabButton
                isActive={activeTab === 'sent'}
                onClick={() => setActiveTab('sent')}
                label="Sent"
                icon={<FiArrowUpRight size={16} />}
                schedules={userPayments}
                isLoading={isLoadingSchedules}
              />
              <TabButton
                isActive={activeTab === 'received'}
                onClick={() => setActiveTab('received')}
                label="Received"
                icon={<FiArrowDownLeft size={16} />}
                schedules={userReceive}
                isLoading={isLoadingSchedules}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="min-w-full">
        {isLoadingSchedules ? (
          <LoadingState />
        ) : (
          <>
            {/* Both tables are rendered but only one is visible */}
            {/* This keeps the state cached and prevents re-rendering */}
            <div className={activeTab === 'sent' ? 'block' : 'hidden'}>
              <ScheduleTable
                schedules={userPayments}
                showUserPayments={true}
                emptyMessage="No sent schedules"
                emptyDescription="Create a schedule to start sending automated transfers"
              />
            </div>
            <div className={activeTab === 'received' ? 'block' : 'hidden'}>
              <ScheduleTable
                schedules={userReceive}
                showUserPayments={false}
                emptyMessage="No received schedules"
                emptyDescription="You haven't received any scheduled transfers yet"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Loading State Component
const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20 px-4">
    <div className="relative">
      {/* Spinning loader */}
      <div
        className="w-16 h-16 rounded-full border-4 border-gray-200
          border-t-primary animate-spin"
      />
      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <FiLoader className="w-6 h-6 text-primary animate-pulse" />
      </div>
    </div>
    <p className="mt-6 text-gray-600 font-medium">Loading schedules...</p>
    <p className="mt-1 text-sm text-gray-400">
      Fetching data from the blockchain
    </p>
  </div>
);

// Tab Button Component
interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  schedules: ScheduleInstance[];
  isLoading?: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({
  isActive,
  onClick,
  label,
  icon,
  schedules,
  isLoading = false,
}) => {
  const count = schedules.length;
  const activeCount = schedules.filter(
    (s) => Number(s.schedule.remaining) > 0,
  ).length;

  const baseClass = `relative flex items-center gap-2 px-5 py-2.5 rounded-lg
    font-medium text-sm transition-all duration-200 ease-out min-w-[140px] justify-center`;
  const activeClass = 'bg-white text-primary shadow-md';
  const inactiveClass = 'text-gray-500 hover:text-gray-700 hover:bg-white/50';

  const badgeBase =
    'px-2 py-0.5 rounded-full text-xs font-semibold transition-all duration-200';
  const badgeActive = 'bg-primary/10 text-primary';
  const badgeInactive = 'bg-gray-200/80 text-gray-600';

  return (
    <button
      className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
      onClick={onClick}
    >
      <span
        className={`transition-transform duration-200 ${
          isActive ? 'scale-110' : ''
        }`}
      >
        {icon}
      </span>
      <span>{label}</span>
      {isLoading ? (
        <span
          className={`${badgeBase} ${isActive ? badgeActive : badgeInactive}
            flex items-center justify-center`}
        >
          <span
            className="w-3 h-3 border-2 border-current
              border-t-transparent rounded-full animate-spin"
          />
        </span>
      ) : count > 0 ? (
        <span
          className={`${badgeBase} ${isActive ? badgeActive : badgeInactive}`}
        >
          {count}
        </span>
      ) : null}
      {/* Active indicator dot */}
      {!isLoading && activeCount > 0 && (
        <span
          className={`absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 
            rounded-full border-2 border-white ${isActive ? '' : 'opacity-70'}`}
        />
      )}
    </button>
  );
};
