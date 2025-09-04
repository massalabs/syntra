import { Schedule } from '@/serializable/Schedule';
import { useSchedulerStore } from '@/store/scheduler';
import { Address, Args, ArrayTypes, Mas } from '@massalabs/massa-web3';
import {
  useAccountStore,
  useWriteSmartContract,
} from '@massalabs/react-ui-kit';
import { getActiveContract } from '@/const/contracts';
import { useDappNetworkStore } from '../store/network';

const HISTORY_ITEM_STORAGE_COST = 2_500_000n;

export default function useSchedule() {
  const { connectedAccount } = useAccountStore();
  const { scheduleInfo, getAllUserPayments } = useSchedulerStore();
  const { network } = useDappNetworkStore();
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
    const updatesCost = HISTORY_ITEM_STORAGE_COST * occurrences;

    // Use the active contract for creating new schedules
    const activeContract = getActiveContract(network);

    const coins =
      Mas.fromString('1') +
      (scheduleInfo.isVesting ? totalAmount : 0n) +
      updatesCost;

    await callSmartContract(
      'startScheduleSend',
      activeContract,
      new Args()
        .addSerializable(Schedule.fromScheduleInfo(scheduleInfo))
        .serialize(),
      {
        success: 'Schedule successfully created',
        pending: 'Creating new schedule...',
        error: 'Failed to create schedule',
      },
      coins,
    );

    getAllUserPayments(connectedAccount.address);
  }

  async function cancelSchedules(
    scheduleContracts: { contractAddress: string; id: bigint }[],
  ) {
    if (!connectedAccount) throw new Error('Connected account is missing');

    // Group schedules by contract address to batch calls efficiently
    const schedulesByContract = scheduleContracts.reduce(
      (acc, { contractAddress, id }) => {
        if (!acc[contractAddress]) {
          acc[contractAddress] = [];
        }
        acc[contractAddress].push(id);
        return acc;
      },
      {} as Record<string, bigint[]>,
    );

    // Cancel schedules on each contract
    await Promise.allSettled(
      Object.entries(schedulesByContract).map(
        async ([contractAddress, ids]) => {
          try {
            await callSmartContract(
              'cancelSchedules',
              contractAddress,
              new Args().addArray(ids, ArrayTypes.U64).serialize(),
              {
                success: `Schedules successfully canceled on contract ${contractAddress}`,
                pending: `Cancelling schedules on contract ${contractAddress}...`,
                error: `Failed to cancel schedules on contract ${contractAddress}`,
              },
            );
            return { contractAddress, success: true, count: ids.length };
          } catch (error) {
            console.error(
              `Failed to cancel schedules on contract ${contractAddress}:`,
              error,
            );
            return {
              contractAddress,
              success: false,
              count: ids.length,
              error,
            };
          }
        },
      ),
    );

    // Refresh all user payments to show updated state
    getAllUserPayments(connectedAccount.address);
  }

  async function manualTrigger(
    contractAddress: string,
    spender: string,
    id: bigint,
  ) {
    if (!connectedAccount) throw new Error('Connected account is missing');

    await callSmartContract(
      'manualTrigger',
      contractAddress,
      new Args().addString(spender).addU64(id).serialize(),
      {
        success: 'Scheduled task successfully triggered',
        pending: 'Triggering missed task...',
        error: 'Failed to trigger scheduled task',
      },
    );

    getAllUserPayments(spender);
  }

  return {
    createSchedule,
    cancelSchedules,
    manualTrigger,
  };
}
