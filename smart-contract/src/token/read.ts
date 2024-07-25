import { Args } from '@massalabs/massa-web3';
import { getClientAndContract } from '../utils';

export async function getBallanceOf(contractAddress: string, spender: string) {
  const { contract } = await getClientAndContract(contractAddress);

  const result = await contract.read(
    'balanceOf',
    new Args().addString(spender).serialize(),
  );

  return new Args(result.value).nextU256();
}

export async function logBalances(
  tokenAddress: string,
  spender: string,
  recipient: string,
) {
  const spenderBalance = await getBallanceOf(tokenAddress, spender);
  const recipientBalance = await getBallanceOf(tokenAddress, recipient);
  console.log('Spender balance:', spenderBalance.toString());
  console.log('Recipient balance:', recipientBalance.toString());
}
