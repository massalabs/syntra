import { Args, parseMas } from '@massalabs/massa-web3';
import { Schedule } from './Schedule';
import { getClientAndContract } from './utils';

export async function create(contractAddress: string, schedule: Schedule) {
  const { contract } = await getClientAndContract(contractAddress);

  const totalAmount = schedule.amount * schedule.occurrences;

  const operation = await contract.call(
    'startScheduleSend',
    new Args().addSerializable(schedule).serialize(),
    {
      coins: parseMas('1') + (schedule.tokenAddress === '' ? totalAmount : 0n),
    },
  );

  await operation.waitSpeculativeExecution();

  return await operation.getSpeculativeEvents();
}
