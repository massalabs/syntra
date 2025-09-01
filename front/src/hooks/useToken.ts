import { Args, Mas } from '@massalabs/massa-web3';
import {
  useAccountStore,
  useWriteSmartContract,
} from '@massalabs/react-ui-kit';
import { useSchedulerStore } from '@/store/scheduler';
import { useTokenStore } from '@/store/token';
import { getActiveContract } from '../const/contracts';
import { useDappNetworkStore } from '../store/network';

export default function useToken() {
  const { connectedAccount } = useAccountStore();
  const { scheduleInfo } = useSchedulerStore();
  const { refreshBalances } = useTokenStore();
  const { callSmartContract } = useWriteSmartContract(connectedAccount!);
  const { network } = useDappNetworkStore();

  async function increaseAllowance(amount: bigint) {
    if (!amount || !connectedAccount) {
      console.error('Missing required fields');
      return;
    } else if (isNaN(Number(amount))) {
      console.error('Invalid amount');
      return;
    }

    // Use the active contract for increasing allowance
    const schedulerAddress = getActiveContract(network);

    await callSmartContract(
      'increaseAllowance',
      scheduleInfo.asset.address,
      new Args().addString(schedulerAddress).addU256(amount).serialize(),
      {
        success: 'Amount approved successfully',
        pending: 'Approving amount...',
        error: 'Failed to approve amount',
      },
      Mas.fromString('0.01'),
    );

    refreshBalances();
  }

  return { increaseAllowance };
}
