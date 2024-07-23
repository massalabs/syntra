import { Address, Args } from '@massalabs/massa-web3';
import { Schedule } from './Schedule';
import { getClientAndContract } from './utils';
import { increaseAllowance } from './allowance';

export async function asyncSend(contractAddress: string, schedule: Schedule) {
  const { client, account, contract } = await getClientAndContract(
    contractAddress,
  );
  await increaseAllowance(
    client,
    account,
    schedule.tokenAddress,
    contractAddress,
    schedule.amount * schedule.occurrences,
  );

  const estimation = await contract.getGasEstimation(
    'asyncSendFT',
    new Args().addSerializable(schedule).serialize(),
    Address.fromString(schedule.spender),
    {},
  );
  console.log('Estimation: ', estimation);

  const operation = await contract.call(
    'asyncSendFT',
    new Args().addSerializable(schedule).serialize(),
  );

  await operation.waitSpeculativeExecution();

  return await operation.getSpeculativeEvents();
}
