import { fakeSchedulerAddress, fakeTokenAddress } from '@/const/contracts';
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
  remaining: bigint;
  tolerance: bigint;
  history: Transfer[];
};

export default function useCreateSchedule() {
  const { connectedAccount, currentProvider } = useAccountStore();

  const { callSmartContract } = useWriteSmartContract(
    connectedAccount!,
    currentProvider!,
  );

  const [scheduleInfo, setInfo] = useState<ScheduleInfo>({
    amount: 0n,
    interval: 0n,
    recipient: '',
    spender: '',
    tokenAddress: '',
    occurrences: 0n,
    remaining: 0n,
    tolerance: 0n,
    history: [],
  });

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
      fakeTokenAddress,
      Schedule.fromScheduleInfo(scheduleInfo).serialize(),
      {
        success: 'Amount approved successfully',
        pending: 'Approving amount...',
        error: 'Failed to approve amount',
      },
      Mas.fromString('0.01'),
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
