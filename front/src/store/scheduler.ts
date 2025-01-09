import { create } from 'zustand';
import { Args, rpcTypes } from '@massalabs/massa-web3';

import { Asset } from '@massalabs/react-ui-kit/src/lib/token/models/AssetModel';
import { Schedule } from '@/serializable/Schedule';
import { MasToken } from '@/const/assets';
import { useAccountStore } from '@massalabs/react-ui-kit';

export type ScheduleInfo = {
  amount: bigint;
  isVesting: boolean;
  interval: bigint;
  recipient: string;
  spender: string;
  asset: Asset;
  occurrences: bigint;
  tolerance: bigint;
};

interface SchedulerStoreState {
  scheduleInfo: ScheduleInfo;
  userPayments: Schedule[];
  userReceive: Schedule[];
  address: string;
  showUserPayments: boolean;
  setSchedulerAddress: (address: string) => void;
  setScheduleInfo: (
    key: keyof ScheduleInfo,
    value: bigint | string | Asset | boolean,
  ) => void;

  setUserPayments: (payments: Schedule[]) => void;
  setUserReceive: (payments: Schedule[]) => void;
  getUserPayments: (spender: string) => Promise<Schedule[]>;
  getUserReceive: (recipient: string) => Promise<Schedule[]>;
  eventPollerStop: () => void;
  setEventPollerStop: (stop: () => void) => void;

  eventPollerStopOld: NodeJS.Timeout;
  setEventPollerStopOld: (timeout: NodeJS.Timeout) => void;
  lastEventSlotOld: rpcTypes.Slot | undefined;
  setLastEventSlotOld: (slot: rpcTypes.Slot) => void;
  setShowUserPayments: (showUserPayments: boolean) => void;
}

const defaultScheduleInfo: ScheduleInfo = {
  isVesting: false,
  amount: 0n,
  interval: 5400n,
  recipient: '',
  spender: '',
  asset: MasToken,
  occurrences: 4n,
  tolerance: 3n,
};

export const useSchedulerStore = create<SchedulerStoreState>((set, get) => ({
  address: '',
  scheduleInfo: defaultScheduleInfo,
  userPayments: [],
  userReceive: [],
  eventPollerStop: () => {},
  eventPollerStopOld: setTimeout(() => {}, 0),
  lastEventSlotOld: undefined,
  showUserPayments: true,

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

  getUserPayments: async (userAddress: string): Promise<Schedule[]> => {
    const { connectedAccount } = useAccountStore.getState();
    if (!connectedAccount) return [];

    const res = await connectedAccount.readSC({
      func: 'getSchedulesBySpender',
      target: get().address,
      parameter: new Args().addString(userAddress).serialize(),
      caller: connectedAccount.address,
    });

    const payments = new Args(res.value).nextSerializableObjectArray(Schedule);
    set({ userPayments: payments });

    return payments;
  },

  getUserReceive: async (userAddress: string): Promise<Schedule[]> => {
    const { connectedAccount } = useAccountStore.getState();
    if (!connectedAccount) return [];

    const res = await connectedAccount.readSC({
      func: 'getScheduleByRecipient',
      target: get().address,
      parameter: new Args().addString(userAddress).serialize(),
      caller: connectedAccount.address,
    });

    const payments = new Args(res.value).nextSerializableObjectArray(Schedule);
    set({ userReceive: payments });

    return payments;
  },

  setUserPayments: (payments: Schedule[]) => {
    set({ userPayments: payments });
  },

  setUserReceive: (payments: Schedule[]) => {
    set({ userReceive: payments });
  },

  setEventPollerStop: (stop: () => void) => {
    set({ eventPollerStop: stop });
  },

  setShowUserPayments: (show: boolean) => {
    set({ showUserPayments: show });
  },
}));
