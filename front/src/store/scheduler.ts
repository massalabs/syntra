import { create } from 'zustand';
import { Args, Slot } from '@massalabs/massa-web3';

import { Asset } from '@massalabs/react-ui-kit/src/lib/token/models/AssetModel';
import { Schedule } from '@/serializable/Schedule';
import { supportedTokens } from '@/const/assets';
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
  address: string;
  setSchedulerAddress: (address: string) => void;
  setScheduleInfo: (
    key: keyof ScheduleInfo,
    value: bigint | string | Asset,
  ) => void;

  getBySpender: (spender: string) => Promise<void>;
  getByRecipient: (recipient: string) => Promise<void>;
  eventPollerStop: () => void;
  setEventPollerStop: (stop: () => void) => void;

  eventPollerStopOld: NodeJS.Timeout;
  setEventPollerStopOld: (timeout: NodeJS.Timeout) => void;
  lastEventSlotOld: Slot | undefined;
  setLastEventSlotOld: (slot: Slot) => void;
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
  address: '',
  scheduleInfo: defaultScheduleInfo,
  spenderSchedules: [],
  eventPollerStop: () => {},
  eventPollerStopOld: setTimeout(() => {}, 0),
  lastEventSlotOld: undefined,

  setLastEventSlotOld: (slot) => {
    set({ lastEventSlotOld: slot });
  },
  setEventPollerStopOld: (timeout) => {
    set({ eventPollerStopOld: timeout });
  },
  setSchedulerAddress: (address: string) => {
    set({ address: address });
  },

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
      target: get().address,
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
      target: get().address,
      parameter: new Args().addString(recipient).serialize(),
      caller: connectedAccount.address,
    });
  },

  setEventPollerStop: (stop: () => void) => {
    set({ eventPollerStop: stop });
  },
}));
