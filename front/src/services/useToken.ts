import { schedulerAddress } from '@/const/contracts';
import { Args, Mas, MRC20 } from '@massalabs/massa-web3';
import {
  useAccountStore,
  useWriteSmartContract,
} from '@massalabs/react-ui-kit';
import { useSchedulerStore } from '@/store/scheduler';
import { useTokenStore } from '@/store/token';

export default function useToken() {
  const { connectedAccount } = useAccountStore();
  const { scheduleInfo } = useSchedulerStore();
  const { refreshBalances } = useTokenStore();
  const { callSmartContract } = useWriteSmartContract(connectedAccount!);

  async function increaseAllowance(amount: bigint) {
    if (!amount || !connectedAccount) {
      console.error('Missing required fields');
      return;
    } else if (isNaN(Number(amount))) {
      console.error('Invalid amount');
      return;
    }
    await callSmartContract(
      'increaseAllowance',
      scheduleInfo.asset.address || '',
      new Args().addString(schedulerAddress).addU256(amount).serialize(),
      {
        success: 'Amount approved successfully',
        pending: 'Approving amount...',
        error: 'Failed to approve amount',
      },
      Mas.fromString('0.01'),
      Mas.fromString('0.01'),
    );
    refreshBalances();
  }

  async function getBalanceOf(address: string): Promise<bigint> {
    if (!address || !connectedAccount) {
      console.error('Missing required fields');
      return BigInt(0);
    }

    const mrc20 = new MRC20(connectedAccount, scheduleInfo.asset.address);
    return await mrc20.balanceOf(address);
  }

  async function getAllowanceOf(
    owner: string,
    spender: string,
  ): Promise<bigint> {
    if (!owner || !spender || !connectedAccount) {
      console.error('Missing required fields');
      return BigInt(0);
    }

    const mrc20 = new MRC20(connectedAccount, scheduleInfo.asset.address);
    return await mrc20.allowance(owner, spender);
  }
  return { increaseAllowance, getBalanceOf, getAllowanceOf };
}
