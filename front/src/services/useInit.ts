import { useEffect, useRef } from 'react';
import { schedulerAddress } from '@/const/contracts';
import { Slot } from '@massalabs/massa-web3/dist/esm/generated/client';
import { toast, useAccountStore } from '@massalabs/react-ui-kit';
import { useSchedulerStore } from '@/store/scheduler';
import { useTokenStore } from '@/store/token';
import { initTokens, initSchedules } from '@/store/store';

export const useInit = () => {
  const { connectedAccount } = useAccountStore();
  const { getBySpender } = useSchedulerStore();
  const { refreshBalances } = useTokenStore();
  const lastEventPeriodRef = useRef<Slot>();
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const isFirstInterval = useRef(true);

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

        events.forEach((event, index) => {
          const regex = /Transfer:([^]+)/;
          const match = event.data.match(regex);
          if (match) {
            if (!isFirstInterval.current) {
              toast.success(event.data);
            }
            getBySpender(connectedAccount.address);
            refreshBalances();
          }
        });

        if (events.length > 0) {
          const { period, thread } = events[events.length - 1].context.slot;
          lastEventPeriodRef.current = { period: period + 1, thread };
        }
        isFirstInterval.current = false;
      }, 4000);
    }

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, [connectedAccount, getBySpender, refreshBalances]);
};
