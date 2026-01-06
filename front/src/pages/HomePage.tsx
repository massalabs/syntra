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
    <div className="flex flex-col items-center min-h-screen">
      {/* Hero Section */}
      <section className="main relative flex flex-col w-full min-h-screen">
        <NavBar />

        {showIntro && <Intro onClose={() => setShowIntro(false)} />}

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center items-center gap-8 py-8 px-4">
          <ScheduleForm />

          {/* Scroll Indicator */}
          <div className="mt-4">
            <ArrowButton onClick={scrollToList} />
          </div>
        </div>
      </section>

      {/* Schedules Section */}
      <section ref={scheduleTableRef} className="min-h-screen w-full">
        <ScheduleTablesSection />
      </section>

      {/* Footer */}
      <footer className="w-full py-6 bg-gray-50 border-t border-gray-100">
        <div className="text-center text-sm text-gray-400">
          Powered by Massa Autonomous Smart Contracts
        </div>
      </footer>
    </div>
  );
}
