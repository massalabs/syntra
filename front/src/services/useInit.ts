import { useEffect } from 'react';
import { useAccountStore } from '@massalabs/react-ui-kit';
import { initApp } from '@/store/store';
import { useSchedulerStore } from '@/store/scheduler';

export const useInit = () => {
  const { connectedAccount } = useAccountStore();
  const { eventPollerStop } = useSchedulerStore();

  useEffect(() => {
    if (connectedAccount) {
      initApp();
    }
  }, [connectedAccount]);

  useEffect(() => {
    return () => {
      if (eventPollerStop) {
        eventPollerStop();
      }
    };
  }, [eventPollerStop]);
};
