import {
  Address,
  Args,
  PublicAPI,
  Account,
  SmartContract,
} from '@massalabs/massa-web3';

export async function increaseAllowance(
  client: PublicAPI,
  account: Account,
  tokenAddress: string,
  operatorAddress: string,
  amount: bigint,
) {
  const contract = SmartContract.fromAddress(
    client,
    Address.fromString(tokenAddress),
    account,
  );
  const operation = await contract.call(
    'increaseAllowance',
    new Args().addString(operatorAddress).addU256(amount).serialize(),
  );

  await operation.waitSpeculativeExecution();

  return await operation.getSpeculativeEvents();
}
