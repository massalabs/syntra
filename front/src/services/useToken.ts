import { schedulerAddress } from '@/const/contracts';
import { truncateAddress } from '@/utils/address';
import { Args, Mas, U256 } from '@massalabs/massa-web3';
import {
  useAccountStore,
  useWriteSmartContract,
} from '@massalabs/react-ui-kit';

export default function useToken(ftAddress: string) {
  const { connectedAccount } = useAccountStore();
  const { callSmartContract } = useWriteSmartContract(connectedAccount!);

  async function getAllowanceOf(spender: string): Promise<bigint> {
    if (!spender || !connectedAccount) {
      console.error('Missing required fields');
      return BigInt(0);
    }

    const op = await connectedAccount.readSC({
      func: 'allowance',
      target: ftAddress,
      caller: connectedAccount.address,
      parameter: new Args()
        .addString(connectedAccount.address)
        .addString(spender)
        .serialize(),
      coins: Mas.fromString('0.01'), // TODO: calibrate allowance storage cost
      fee: Mas.fromString('0.01'), // TODO GET MINIMUM FEE
      maxGas: BigInt(4000000000), // TODO: calibrate gas
    });

    console.log(
      `Allowance of ${truncateAddress(spender)}:`,
      U256.fromBytes(op.value),
    );

    return U256.fromBytes(op.value);
  }

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
      ftAddress,
      new Args().addString(schedulerAddress).addU256(amount).serialize(),
      {
        success: 'Amount approved successfully',
        pending: 'Approving amount...',
        error: 'Failed to approve amount',
      },
      Mas.fromString('0.01'),
      Mas.fromString('0.01'),
    );
  }

  async function decreaseAllowance(amount: bigint) {
    if (!amount || !connectedAccount) {
      console.error('Missing required fields');
      return;
    } else if (isNaN(Number(amount))) {
      console.error('Invalid amount');
      return;
    }

    await callSmartContract(
      'decreaseAllowance',
      ftAddress,
      new Args().addString(schedulerAddress).addU256(U256.MAX).serialize(),
      {
        success: 'Amount approved successfully',
        pending: 'Approving amount...',
        error: 'Failed to approve amount',
      },
      Mas.fromString('0.01'),
      Mas.fromString('0.01'),
    );
  }

  async function getBalanceOf(address: string): Promise<bigint> {
    if (!address || !connectedAccount) {
      console.error('Missing required fields');
      return BigInt(0);
    }

    const op = await connectedAccount.readSC({
      func: 'balanceOf',
      target: ftAddress,
      caller: connectedAccount.address,
      parameter: new Args().addString(address).serialize(),
      coins: Mas.fromString('0.01'),
      fee: Mas.fromString('0.01'),
      maxGas: BigInt(4000000000),
    });

    console.log(
      `Balance of ${truncateAddress(address)}:`,
      U256.fromBytes(op.value),
    );

    return U256.fromBytes(op.value);
  }

  return { increaseAllowance, getBalanceOf, getAllowanceOf, decreaseAllowance };
}
