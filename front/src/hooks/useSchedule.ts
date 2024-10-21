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
    getBySpender,
    address: schedulerAddress,
  } = useSchedulerStore();
  const { callSmartContract } = useWriteSmartContract(connectedAccount!);

  async function createSchedule() {
    const { amount, interval, recipient, occurrences } = scheduleInfo;
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

    const totalAmount = amount * occurrences;

    await callSmartContract(
      'startScheduleSend',
      schedulerAddress,
      new Args()
        .addSerializable(Schedule.fromScheduleInfo(scheduleInfo))
        .serialize(),
      {
        success: 'Schedule successfully created',
        pending: 'Creating new schedule...',
        error: 'Failed to create schedule',
      },
      Mas.fromString('1') + (scheduleInfo.isVesting ? totalAmount : 0n),
    );

    getBySpender(connectedAccount.address);
  }

  async function cancelSchedules(ids: bigint[]) {
    if (!connectedAccount) throw new Error('Connected account is missing');

    await callSmartContract(
      'cancelSchedules',
      schedulerAddress,
      new Args().addArray(ids, ArrayTypes.U64).serialize(),
      {
        success: 'Schedules successfully canceled',
        pending: 'Cancelling schedules...',
        error: 'Failed to cancel schedules',
      },
    );

    getBySpender(connectedAccount.address);
  }

  async function manualTrigger(spender: string, id: bigint) {
    if (!connectedAccount) throw new Error('Connected account is missing');

    await callSmartContract(
      'manualTrigger',
      schedulerAddress,
      new Args().addString(spender).addU64(id).serialize(),
      {
        success: 'Scheduled task successfully triggered',
        pending: 'Triggering missed task...',
        error: 'Failed to trigger scheduled task',
      },
    );

    getBySpender(spender);
  }

  return {
    createSchedule,
    cancelSchedules,
    manualTrigger,
  };
}
