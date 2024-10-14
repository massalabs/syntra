import { useEffect } from 'react';
import { toast, useAccountStore } from '@massalabs/react-ui-kit';
import { initApp } from '@/store/store';
import { useSchedulerStore } from '@/store/scheduler';
import { useNetworkStore } from '@/store/network';

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

  const { network: n } = useAccountStore();
  const { network } = useNetworkStore();

  useEffect(() => {
    if (!n) return;
    if (n !== network) {
      toast.error(`Please switch to ${network} network`);
    }
  }, [network, n]);
};
