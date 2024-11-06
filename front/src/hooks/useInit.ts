import { useEffect } from 'react';
import { toast, useAccountStore } from '@massalabs/react-ui-kit';
import { initApp, resetApp } from '@/store/store';
import { useSchedulerStore } from '@/store/scheduler';
import useAccountSync from './useAccountSync';
import { dappNetwork } from '@/const/network';

export const useInit = () => {
  const { eventPollerStop } = useSchedulerStore();
  const { connectedAccount, network: walletNetwork } = useAccountStore();

  useAccountSync();

  useEffect(() => {
    if (!connectedAccount) {
      resetApp();
    }

    if (connectedAccount && walletNetwork) {
      if (walletNetwork.name !== dappNetwork) {
        toast.error(`Please switch to ${dappNetwork} network`);
        return;
      }
      initApp(connectedAccount, walletNetwork.name);
    }
  }, [connectedAccount, walletNetwork]);

  useEffect(() => {
    return () => {
      if (eventPollerStop) {
        eventPollerStop();
      }
    };
  }, [eventPollerStop]);
};
