import { create } from 'zustand';
import { Args } from '@massalabs/massa-web3';

import { Asset } from '@massalabs/react-ui-kit/src/lib/token/models/AssetModel';
import { Schedule } from '@/serializable/Schedule';
import { schedulerAddress } from '@/const/contracts';
import { supportedTokens } from '@/const/tokens';
import { useAccountStore } from '@massalabs/react-ui-kit';

export type ScheduleInfo = {
  amount: bigint;
  interval: bigint;
  recipient: string;
  spender: string;
  asset: Asset;
  occurrences: bigint;
  tolerance: bigint;
};

interface SchedulerStoreState {
  scheduleInfo: ScheduleInfo;
  spenderSchedules: Schedule[];

  setScheduleInfo: (
    key: keyof ScheduleInfo,
    value: bigint | string | Asset,
  ) => void;

  getBySpender: (spender: string) => Promise<void>;
  getByRecipient: (recipient: string) => Promise<void>;
}

const defaultScheduleInfo: ScheduleInfo = {
  amount: 0n,
  interval: 10n,
  recipient: 'AU1dvPZNjcTQfNQQuysWyxLLhEzw4kB9cGW2RMMVAQGrkzZHqWGD',
  spender: '',
  asset: supportedTokens[0],
  occurrences: 4n,
  tolerance: 3n,
};

export const useSchedulerStore = create<SchedulerStoreState>((set, get) => ({
  scheduleInfo: defaultScheduleInfo,
  spenderSchedules: [],

  setScheduleInfo: (key, value) =>
    set((state) => ({
      scheduleInfo: { ...state.scheduleInfo, [key]: value },
    })),

  getBySpender: async (spender: string) => {
    const { connectedAccount } = useAccountStore.getState();
    if (!connectedAccount) {
      console.error('You must be connected to an account');
      return;
    }

    const res = await connectedAccount.readSC({
      func: 'getSchedulesBySpender',
      target: schedulerAddress,
      parameter: new Args().addString(spender).serialize(),
      caller: connectedAccount.address,
    });

    const schedules = new Args(res.value).nextSerializableObjectArray(Schedule);
    set({ spenderSchedules: schedules });
  },

  getByRecipient: async (recipient: string) => {
    const { connectedAccount } = useAccountStore.getState();
    if (!connectedAccount) {
      console.error('You must be connected to an account');
      return;
    }

    await connectedAccount.readSC({
      func: 'getScheduleByRecipient',
      target: schedulerAddress,
      parameter: new Args().addString(recipient).serialize(),
      caller: connectedAccount.address,
    });
  },
}));
