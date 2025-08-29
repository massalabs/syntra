import { Args } from '@massalabs/massa-web3';
import { Schedule } from './Schedule';
import { getClientAndContract } from './utils';
import { getSchedulesByRecipient } from './read';

export async function asyncSend(schedule: Schedule) {
  const { contract } = await getClientAndContract();

  const args = new Args()
    .addString(schedule.spender)
    .addU64(schedule.id)
    .serialize();

  const operation = await contract.call('asyncSendFT', args);

  await operation.waitSpeculativeExecution();

  return await operation.getSpeculativeEvents();
}

const contractAddress = 'AS1SRS9S6rKwgAMFkKTquGRHcpkQuHMLC8bU77knuAdut6DuBKMC';
const recipient = 'AU1wN8rn4SkwYSTDF3dHFY4U28KtsqKL1NnEjDZhHnHEy6cEQm53';
const schedule = new Schedule(
  1n,
  contractAddress,
  'AU1Bknx3Du4aiGiHaeh1vo7LfwEPRF3piAwotRkdK975qCBxWwLs',
  recipient,
  1n,
  1n,
  1n,
  1n,
  1n,
);

asyncSend(schedule);

console.log(await getSchedulesByRecipient(contract, recipient));
