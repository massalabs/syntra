import { Args, Mas } from '@massalabs/massa-web3';
import { Schedule } from './Schedule';
import { getClientAndContract } from './utils';

// with MAS:
// create cost 44300000
// update cost 900000
// with FT:
// create cost 49500000
// update cost first 10500000
// update cost 900000
export async function create(contractAddress: string, schedule: Schedule) {
  const { contract } = await getClientAndContract(contractAddress);

  const totalAmount = schedule.amount * schedule.occurrences;
  const coins = schedule.tokenAddress.length
    ? Mas.fromString('0.0315') + Mas.fromString('0.0142') // 0.0457
    : totalAmount;

  const operation = await contract.call(
    'startScheduleSend',
    new Args().addSerializable(schedule).serialize(),
    { coins },
  );

  await operation.waitSpeculativeExecution();

  return await operation.getSpeculativeEvents();
}
