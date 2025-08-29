import { Args, Provider, SmartContract } from '@massalabs/massa-web3';
import { Schedule } from './Schedule';

export async function getSchedulesBySpender(
  contract: SmartContract,
  spender: string,
) {
  const result = await contract.read(
    'getSchedulesBySpender',
    new Args().addString(spender).serialize(),
  );

  return new Args(result.value).nextSerializableObjectArray<Schedule>(Schedule);
}

export async function getSchedulesByRecipient(
  contract: SmartContract,
  recipient: string,
) {
  const result = await contract.read(
    'getSchedulesByRecipient',
    new Args().addString(recipient).serialize(),
  );

  return new Args(result.value).nextSerializableObjectArray<Schedule>(Schedule);
}

export async function getAllSchedules(
  provider: Provider,
  contractAddress: string,
) {
  const keys = await provider.getStorageKeys(contractAddress, 'SCHEDULE');

  const results = await provider.readStorage(contractAddress, keys);

  const schedules = results
    .filter((result) => result !== null)
    .map((result) => new Args(result).nextSerializable(Schedule));

  return schedules;
}
