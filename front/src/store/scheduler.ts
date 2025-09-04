import { create } from 'zustand';
import { Args, rpcTypes } from '@massalabs/massa-web3';

import { Asset } from '@massalabs/react-ui-kit/src/lib/token/models/AssetModel';
import { Schedule } from '@/serializable/Schedule';
import { MasToken } from '@/const/assets';
import { useAccountStore } from '@massalabs/react-ui-kit';
import { getAllContractAddresses } from '../const/contracts';
import { useDappNetworkStore } from './network';

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

export type ScheduleInstance = {
  contract: string;
  schedule: Schedule;
};

interface SchedulerStoreState {
  scheduleInfo: ScheduleInfo;
  userPayments: ScheduleInstance[];
  userReceive: ScheduleInstance[];
  setScheduleInfo: (
    key: keyof ScheduleInfo,
    value: bigint | string | Asset | boolean,
  ) => void;

  setUserPayments: (payments: ScheduleInstance[]) => void;
  setUserReceive: (payments: ScheduleInstance[]) => void;
  eventPollerStop: () => void;
  setEventPollerStop: (stop: () => void) => void;

  eventPollerStopOld: NodeJS.Timeout;
  setEventPollerStopOld: (timeout: NodeJS.Timeout) => void;
  lastEventSlotOld: rpcTypes.Slot | undefined;
  setLastEventSlotOld: (slot: rpcTypes.Slot) => void;

  // New multi-contract methods
  getAllUserPayments: (spender: string) => Promise<ScheduleInstance[]>;
  getAllUserReceive: (recipient: string) => Promise<ScheduleInstance[]>;
  getSchedulesByContract: (
    contractAddress: string,
    userAddress: string,
    isSpender: boolean,
  ) => Promise<Schedule[]>;
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
  scheduleInfo: defaultScheduleInfo,
  userPayments: [],
  userReceive: [],
  eventPollerStop: () => {},
  eventPollerStopOld: setTimeout(() => {}, 0),
  lastEventSlotOld: undefined,

  setLastEventSlotOld: (slot) => {
    set({ lastEventSlotOld: slot });
  },
  setEventPollerStopOld: (timeout) => {
    set({ eventPollerStopOld: timeout });
  },

  setScheduleInfo: (key, value) =>
    set((state) => ({
      scheduleInfo: { ...state.scheduleInfo, [key]: value },
    })),

  setUserPayments: (payments: ScheduleInstance[]) => {
    set({ userPayments: payments });
  },

  setUserReceive: (payments: ScheduleInstance[]) => {
    set({ userReceive: payments });
  },

  setEventPollerStop: (stop: () => void) => {
    set({ eventPollerStop: stop });
  },

  // New multi-contract methods
  getAllUserPayments: async (spender: string): Promise<ScheduleInstance[]> => {
    const { network } = useDappNetworkStore.getState();
    const contractAddresses = getAllContractAddresses(network);

    const allSchedules: ScheduleInstance[] = [];

    for (const contractAddress of contractAddresses) {
      try {
        const schedules = await get().getSchedulesByContract(
          contractAddress,
          spender,
          true,
        );
        allSchedules.push(
          ...schedules.map((schedule) => ({
            contract: contractAddress,
            schedule,
          })),
        );
      } catch (error) {
        console.warn(
          `Failed to fetch schedules from contract ${contractAddress}:`,
          error,
        );
        // Continue with other contracts even if one fails
      }
    }

    get().setUserPayments(allSchedules);

    return allSchedules;
  },

  getAllUserReceive: async (recipient: string): Promise<ScheduleInstance[]> => {
    const { network } = useDappNetworkStore.getState();
    const contractAddresses = getAllContractAddresses(network);
    const allSchedules: ScheduleInstance[] = [];

    for (const contractAddress of contractAddresses) {
      try {
        const schedules = await get().getSchedulesByContract(
          contractAddress,
          recipient,
          false,
        );
        allSchedules.push(
          ...schedules.map((schedule) => ({
            contract: contractAddress,
            schedule,
          })),
        );
      } catch (error) {
        console.warn(
          `Failed to fetch schedules from contract ${contractAddress}:`,
          error,
        );
        // Continue with other contracts even if one fails
      }
    }

    get().setUserReceive(allSchedules);

    return allSchedules;
  },

  getSchedulesByContract: async (
    contractAddress: string,
    userAddress: string,
    isSpender: boolean,
  ): Promise<Schedule[]> => {
    const { connectedAccount } = useAccountStore.getState();
    if (!connectedAccount) return [];

    const func = isSpender ? 'getSchedulesBySpender' : 'getScheduleByRecipient';

    try {
      const res = await connectedAccount.readSC({
        func,
        target: contractAddress,
        parameter: new Args().addString(userAddress).serialize(),
        caller: connectedAccount.address,
      });

      if (res.info.error) {
        console.warn(
          `Error calling ${func} on contract ${contractAddress}:`,
          res.info.error,
        );
        return [];
      }

      return new Args(res.value).nextSerializableObjectArray(Schedule);
    } catch (error) {
      console.error(
        `Error calling ${func} on contract ${contractAddress}:`,
        error,
      );
      throw error;
    }
  },
}));
