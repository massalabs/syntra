import { Schedule } from '@/serializable/Schedule';
import { useSchedulerStore } from '@/store/scheduler';
import { Address, Args, Mas } from '@massalabs/massa-web3';
import {
  useAccountStore,
  useWriteSmartContract,
} from '@massalabs/react-ui-kit';

export default function useSchedule() {
  const { connectedAccount } = useAccountStore();
  const {
    scheduleInfo,
    setScheduleInfo,
    getBySpender,
    getByRecipient,
    spenderSchedules,
    address: schedulerAddress,
  } = useSchedulerStore();
  const { callSmartContract } = useWriteSmartContract(connectedAccount!);

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
    }

    try {
      Address.fromString(recipient);
    } catch (error) {
      throw new Error('Invalid recipient address');
    }

    await callSmartContract(
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

    getBySpender(connectedAccount.address);
  }

  return {
    scheduleInfo,
    setScheduleInfo,
    createSchedule,
    getBySpender,
    getByRecipient,
    spenderSchedules,
  };
}
