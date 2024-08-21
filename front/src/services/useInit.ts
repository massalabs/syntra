import { schedulerAddress } from '@/const/contracts';
import { Slot } from '@massalabs/massa-web3/dist/esm/generated/client';
import { toast, useAccountStore } from '@massalabs/react-ui-kit';
import { useEffect, useRef } from 'react';
import { useSchedulerStore } from '@/store/scheduler';
import { useTokenStore } from '@/store/token';
import { initTokens, initSchedules } from '@/store/store';

export const useInit = () => {
  const { connectedAccount } = useAccountStore();
  const { getBySpender } = useSchedulerStore();
  const { refreshBalances } = useTokenStore();
  const lastEventPeriodRef = useRef<Slot>();
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (connectedAccount) {
      initTokens();
      initSchedules();
    }
  }, [connectedAccount]);

  useEffect(() => {
    if (connectedAccount) {
      intervalId.current = setInterval(async () => {
        const events = await connectedAccount.getEvents({
          smartContractAddress: schedulerAddress,
          start: lastEventPeriodRef.current,
        });

        for (const event of events) {
          const regex = /Transfer:([^]+)/;
          const match = event.data.match(regex);
          if (match) {
            toast.success(event.data);
            getBySpender(connectedAccount.address);
            refreshBalances();
          }
        }

        if (events.length <= 0) {
          return;
        }

        const { period, thread } = events[events.length - 1].context.slot;

        lastEventPeriodRef.current = { period: period + 1, thread };
      }, 4000);
    }

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, [connectedAccount, getBySpender, refreshBalances]);
};
