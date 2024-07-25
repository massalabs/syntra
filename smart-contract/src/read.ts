import { Args } from '@massalabs/massa-web3';
import { getClientAndContract } from './utils';
import { Schedule } from './Schedule';

export async function getSchedulesBySpender(
  contractAddress: string,
  spender: string,
) {
  const { contract } = await getClientAndContract(contractAddress);

  const result = await contract.read(
    'getSchedulesBySpender',
    new Args().addString(spender).serialize(),
  );

  return new Args(result.value).nextSerializableObjectArray<Schedule>(Schedule);
}

export async function getSchedulesByRecipient(
  contractAddress: string,
  spender: string,
) {
  const { contract } = await getClientAndContract(contractAddress);

  const result = await contract.read(
    'getSchedulesByRecipient',
    new Args().addString(spender).serialize(),
  );

  return new Args(result.value).nextSerializableObjectArray<Schedule>(Schedule);
}
