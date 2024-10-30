import { useEffect } from 'react';
import { toast, useAccountStore } from '@massalabs/react-ui-kit';
import { initApp } from '@/store/store';
import { useSchedulerStore } from '@/store/scheduler';
import { AvailableNetwork, useNetworkStore } from '@/store/network';
import useAccountSync from './useAccountSync';

export const useInit = () => {
  const { eventPollerStop } = useSchedulerStore();
  const { connectedAccount, network: walletNetwork } = useAccountStore();
  const { network: dappNetwork } = useNetworkStore();
  useAccountSync();

  useEffect(() => {
    if (connectedAccount && walletNetwork) {
      initApp(connectedAccount, walletNetwork as AvailableNetwork);
    }
  }, [connectedAccount, walletNetwork]);

  useEffect(() => {
    return () => {
      if (eventPollerStop) {
        eventPollerStop();
      }
    };
  }, [eventPollerStop]);

  useEffect(() => {
    if (!walletNetwork) return;
    if (walletNetwork !== dappNetwork)
      toast.error(`Please switch to ${dappNetwork} network`);
  }, [dappNetwork, walletNetwork]);
};
