import { Args, parseMas, SmartContract } from '@massalabs/massa-web3';
import { Schedule } from './Schedule';

export async function create(contract: SmartContract, schedule: Schedule) {
  console.log('Creating', schedule);
  const totalAmount = schedule.amount * schedule.occurrences;

  const operation = await contract.call(
    'startScheduleSend',
    new Args().addSerializable(schedule).serialize(),
    {
      coins: parseMas('1') + (schedule.tokenAddress === '' ? totalAmount : 0n),
    },
  );

  return operation.getSpeculativeEvents();
}
