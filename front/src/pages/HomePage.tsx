/* eslint-disable max-len */
import { useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowButton } from '@/components/ArrowButton';
import { ScheduleForm } from '@/components/ScheduleForm';
import { NavBar } from '@/components/NavBar';
import { useSchedulerStore } from '@/store/scheduler';
import { ScheduleTablesSection } from '@/components/ScheduleTablesSection';

export default function HomePage() {
  const { scheduleInfo, setScheduleInfo } = useSchedulerStore();
  const scheduleTableRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const recipientQuery = searchParams.get('recipient');

  if (recipientQuery && scheduleInfo.recipient == '') {
    setScheduleInfo('recipient', recipientQuery);
  }

  const scrollToList = () => {
    if (scheduleTableRef.current) {
      scheduleTableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="main flex flex-col w-full">
        <NavBar />
        <div className="p-6 bg-white text-center text-gray-800 bg-opacity-65 rounded-lg shadow-lg my-6 max-w-2xl mx-auto">
          <p className="text-lg font-semibold">
            Syntra is a cutting-edge dApp powered by Massa's autonomous smart
            contracts, designed to simplify token scheduling like never before.
          </p>
          <p className="text-lg mt-2">
            Whether you're tipping content creators or managing token vesting,
            Syntra ensures seamless, automated transactions.
          </p>
        </div>
        <div className="flex flex-col justify-center items-center gap-10 h-full">
          <ScheduleForm />
          <ArrowButton onClick={scrollToList} />
        </div>
      </div>

      <div ref={scheduleTableRef} className="h-screen bg-white w-full my-6 ">
        <ScheduleTablesSection />
      </div>
    </div>
  );
}
