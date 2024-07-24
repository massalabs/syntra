import {
  Address,
  Args,
  PublicAPI,
  Account,
  SmartContract,
} from '@massalabs/massa-web3';

export async function mint(
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
    'mint',
    new Args().addString(operatorAddress).addU256(amount).serialize(),
  );

  await operation.waitSpeculativeExecution();

  return await operation.getSpeculativeEvents();
}
