import { fakeTokenAddress, fakeSchedulerAddress } from '@/const/contracts';
import { Args, Mas, U256 } from '@massalabs/massa-web3';
import {
  useAccountStore,
  useWriteSmartContract,
} from '@massalabs/react-ui-kit';

export default function useToken(address: string) {
  const { connectedAccount, currentProvider } = useAccountStore();
  const { callSmartContract } = useWriteSmartContract(
    connectedAccount!,
    currentProvider!,
  );

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
      fakeTokenAddress,
      new Args().addString(fakeSchedulerAddress).addU256(amount).serialize(),
      {
        success: 'Amount approved successfully',
        pending: 'Approving amount...',
        error: 'Failed to approve amount',
      },
      Mas.fromString('0.01'),
      Mas.fromString('0.01'),
    );
  }

  async function getBalanceOf(address: string) {
    if (!address || !connectedAccount) {
      console.error('Missing required fields');
      return;
    }

    console.log('Calling smart contract...');

    const op = await connectedAccount.readSc(
      fakeTokenAddress,
      'balanceOf',
      new Args().addString(address).serialize(),
      Mas.fromString('0.01'),
      Mas.fromString('0.01'),
      BigInt(4000000000),
    );

    console.log('Operation:', U256.fromBytes(op.returnValue));
  }

  return { increaseAllowance, getBalanceOf };
}
