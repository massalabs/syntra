import { schedulerAddress, fakeTokenAddress } from '@/const/contracts';
import { Schedule, Transfer } from '@/serializable/Schedule';
import { Address, JsonRPCClient, Mas, Operation } from '@massalabs/massa-web3';
import {
  useAccountStore,
  useWriteSmartContract,
} from '@massalabs/react-ui-kit';
import { useState } from 'react';

type ScheduleInfo = {
  amount: bigint;
  interval: bigint;
  recipient: string;
  spender: string;
  tokenAddress: string;
  occurrences: bigint;
  tolerance: bigint;
};

const defaultScheduleInfo: ScheduleInfo = {
  amount: Mas.fromString('0.1'),
  interval: 10n,
  recipient: 'AU1dvPZNjcTQfNQQuysWyxLLhEzw4kB9cGW2RMMVAQGrkzZHqWGD',
  spender: 'AU12FUbb8snr7qTEzSdTVH8tbmEouHydQTUAKDXY9LDwkdYMNBVGF',
  tokenAddress: fakeTokenAddress,
  occurrences: 4n,
  tolerance: 4n,
};

export default function useCreateSchedule() {
  const { connectedAccount, currentProvider } = useAccountStore();

  const { callSmartContract } = useWriteSmartContract(
    connectedAccount!,
    currentProvider!,
  );

  const [scheduleInfo, setInfo] = useState<ScheduleInfo>(defaultScheduleInfo);

  const setScheduleInfo = (
    key: keyof ScheduleInfo,
    value: bigint | string | Transfer[],
  ) => {
    setInfo((prev) => {
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  async function createSchedule() {
    const { amount, interval, recipient } = scheduleInfo;

    if (!amount || !interval || !recipient || !connectedAccount) {
      console.error('Missing required fields');
      return;
    } else if (isNaN(Number(amount))) {
      console.error('Invalid amount');
      return;
    }

    try {
      Address.fromString(recipient);
    } catch (error) {
      throw new Error('Invalid recipient address');
    }
    const op = await callSmartContract(
      'startScheduleSendFT',
      schedulerAddress,
      Schedule.fromScheduleInfo(scheduleInfo).serialize(),
      {
        success: 'Schedule successfully created',
        pending: 'Creating new schedule...',
        error: 'Failed to create schedule',
      },
      Mas.fromString('0.3'),
      Mas.fromString('0.01'),
    );

    if (!op) {
      console.error('Failed to start schedule');
      return;
    }

    const operation = new Operation(JsonRPCClient.buildnet(), op);
    const event = await operation.getSpeculativeEvents();

    for (const e of event) {
      console.log('Event:', e.data);
    }
  }

  return {
    scheduleInfo,
    setScheduleInfo,
    createSchedule,
  };
}
