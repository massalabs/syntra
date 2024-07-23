import { Args, Mas } from '@massalabs/massa-web3';
import { Schedule } from './Schedule';
import { getClientAndContract } from './utils';

const coins = Mas.fromString('0.0315') + Mas.fromString('0.0142');

export async function create(contractAddress: string, schedule: Schedule) {
  const { contract } = await getClientAndContract(contractAddress);

  const operation = await contract.call(
    'startScheduleSendFT',
    new Args().addSerializable(schedule).serialize(),
    { coins },
  );

  await operation.waitSpeculativeExecution();

  return await operation.getSpeculativeEvents();
}
