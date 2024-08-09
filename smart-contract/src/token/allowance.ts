import { Args, SmartContract, Provider } from '@massalabs/massa-web3';

export async function increaseAllowance(
  provider: Provider,
  tokenAddress: string,
  operatorAddress: string,
  amount: bigint,
) {
  const contract = new SmartContract(provider, tokenAddress);
  const operation = await contract.call(
    'increaseAllowance',
    new Args().addString(operatorAddress).addU256(amount).serialize(),
  );

  await operation.waitSpeculativeExecution();

  return await operation.getSpeculativeEvents();
}
