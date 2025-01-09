/* eslint-disable max-len */
import { useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowButton } from '@/components/ArrowButton';
import { ScheduleForm } from '@/components/ScheduleForm';
import { NavBar } from '@/components/NavBar';
import { useSchedulerStore } from '@/store/scheduler';
import { ScheduleTablesSection } from '@/components/ScheduleTablesSection';
import { Intro } from '@/components/Explanation';
import { useLocalStorage } from '@massalabs/react-ui-kit/src/lib/util/hooks/useLocalStorage';

export default function HomePage() {
  const { scheduleInfo, setScheduleInfo } = useSchedulerStore();
  const scheduleTableRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const recipientQuery = searchParams.get('recipient');
  const [showIntro, setShowIntro] = useLocalStorage<boolean>('showIntro', true);

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
      <div className="main flex flex-col w-full h-screen">
        <NavBar />
        {showIntro && <Intro onClose={() => setShowIntro(false)} />}
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
