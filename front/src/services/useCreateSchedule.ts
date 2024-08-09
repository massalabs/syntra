import { assets } from '@/const/assets';
import { schedulerAddress } from '@/const/contracts';
import { Schedule, Transfer } from '@/serializable/Schedule';
import { Address, Args, Mas, SmartContract } from '@massalabs/massa-web3';
import {
  useAccountStore,
  useWriteSmartContract,
} from '@massalabs/react-ui-kit';
import { Asset } from '@massalabs/react-ui-kit/src/lib/token/models/AssetModel';
import { useState } from 'react';

export type ScheduleInfo = {
  amount: bigint;
  interval: bigint;
  recipient: string;
  spender: string;
  asset: Asset;
  occurrences: bigint;
  tolerance: bigint;
};

const defaultScheduleInfo: ScheduleInfo = {
  amount: 0n, // TODO - if amount zero button should be disabled with tips
  interval: 10n, // TODO - fix  this: currently the input does not depend on this value
  recipient: 'AU1dvPZNjcTQfNQQuysWyxLLhEzw4kB9cGW2RMMVAQGrkzZHqWGD',
  spender: '',
  asset: assets[0],
  occurrences: 4n,
  tolerance: 3n,
};

export default function useCreateSchedule() {
  const { connectedAccount } = useAccountStore();

  const { callSmartContract } = useWriteSmartContract(connectedAccount!);

  const [scheduleInfo, setInfo] = useState<ScheduleInfo>(defaultScheduleInfo);

  const setScheduleInfo = (
    key: keyof ScheduleInfo,
    value: bigint | string | Transfer[] | Asset,
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
    scheduleInfo.spender = connectedAccount!.address;

    if (!amount || !interval || !recipient || !connectedAccount) {
      if (!amount) {
        console.error('Amount is missing');
      }
      if (!interval) {
        console.error('Interval is missing');
      }
      if (!recipient) {
        console.error('Recipient is missing');
      }
      if (!connectedAccount) {
        console.error('Connected account is missing');
      }

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

    const operation = await callSmartContract(
      'startScheduleSendFT',
      schedulerAddress,
      new Args()
        .addSerializable(Schedule.fromScheduleInfo(scheduleInfo))
        .serialize(),
      {
        success: 'Schedule successfully created',
        pending: 'Creating new schedule...',
        error: 'Failed to create schedule',
      },
      Mas.fromString('10'),
      Mas.fromString('0.01'),
    );

    if (!operation) {
      console.error('Failed to start schedule');
      return;
    }

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
