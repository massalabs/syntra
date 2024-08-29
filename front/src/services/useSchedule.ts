import { Schedule } from '@/serializable/Schedule';
import { useSchedulerStore } from '@/store/scheduler';
import { Address, Args, ArrayTypes, Mas } from '@massalabs/massa-web3';
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
        throw new Error('Amount is missing');
      }
      if (!interval) {
        console.error('Interval is missing');
      }
      if (!recipient) {
        throw new Error('Recipient is missing');
      }
      if (!connectedAccount) {
        throw new Error('Connected account is missing');
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

  async function cancelSchedules(ids: bigint[]) {
    if (!connectedAccount) throw new Error('Connected account is missing');

    await callSmartContract(
      'cancelSchedules',
      schedulerAddress,
      new Args()
        .addString(connectedAccount.address)
        .addArray(ids, ArrayTypes.U64)
        .serialize(),
      {
        success: 'Schedules successfully canceled',
        pending: 'Cancelling schedules...',
        error: 'Failed to cancel schedules',
      },
      Mas.fromString('1'),
      Mas.fromString('0.01'),
    );

    getBySpender(connectedAccount.address);
  }
  return {
    scheduleInfo,
    spenderSchedules,
    getBySpender,
    createSchedule,
    getByRecipient,
    setScheduleInfo,
    cancelSchedules,
  };
}
