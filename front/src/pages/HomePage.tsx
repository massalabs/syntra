import { useRef } from 'react';
import useSchedule from '@/hooks/useSchedule';
import ScheduleTable from '@/components/ScheduleTable';
import { useSearchParams } from 'react-router-dom';
import { ArrowButton } from '@/components/ArrowButton';
import { ScheduleForm } from '@/components/ScheduleForm';
import { NavBar } from '@/components/NavBar';
// TODO: Add network and check if the user is connected to the right network
// TODO: Remove or fix event
export default function HomePage() {
  const { scheduleInfo, setScheduleInfo, spenderSchedules } = useSchedule();
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
    <div className="">
      <div className="main h-screen">
        <NavBar />
        <div className="flex flex-col justify-center items-center gap-10 h-full">
          <ScheduleForm />
          <ArrowButton onClick={scrollToList} />
        </div>
      </div>
      <div ref={scheduleTableRef} className="h-screen bg-white">
        <ScheduleTable schedules={spenderSchedules} />
      </div>
    </div>
  );
}
