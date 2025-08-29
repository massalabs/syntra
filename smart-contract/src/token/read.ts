import { MRC20 } from '@massalabs/massa-web3';

export async function logBalances(
  contract: MRC20,
  spender: string,
  recipient: string,
) {
  const spenderBalance = await contract.balanceOf(spender);
  const recipientBalance = await contract.balanceOf(recipient);
  console.log('Spender balance:', spenderBalance.toString());
  console.log('Recipient balance:', recipientBalance.toString());
}
