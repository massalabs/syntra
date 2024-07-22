import { Address, Args, Mas } from '@massalabs/massa-web3';
import { Schedule } from './Schedule';
import * as dotenv from 'dotenv';
import { deploy } from './deploy';
import { getClientAndContract } from './utils';
import { increaseAllowance } from './allowance';
dotenv.config();

let contractAddress = 'AS1dxUg417H4FHC33x9nYkDt5MckamjiVcEJ7HLyB43u4gxe7pQC';

const spender = 'AU1Bknx3Du4aiGiHaeh1vo7LfwEPRF3piAwotRkdK975qCBxWwLs'; // your address corresponding to the .env pk
const tokenAddress = 'AS12FW5Rs5YN2zdpEnqwj4iHUUPt9R4Eqjq2qtpJFNKW3mn33RuLU'; // WMAS buildnet,
const amount = Mas.fromString('0.1');
const schedule = new Schedule(
  0n,
  tokenAddress,
  spender,
  'AU1wN8rn4SkwYSTDF3dHFY4U28KtsqKL1NnEjDZhHnHEy6cEQm53', // buildnet main account,
  amount,
  20n,
  1n,
  1n,
  1n,
);

const coins = Mas.fromString('0.0315') + Mas.fromString('0.0142');

async function send() {
  const { client, account, contract } = await getClientAndContract(
    contractAddress,
  );
  await increaseAllowance(
    client,
    account,
    tokenAddress,
    contractAddress,
    amount,
  );

  const estimation = await contract.getGasEstimation(
    'asyncSendFT',
    new Args().addSerializable(schedule).serialize(),
    Address.fromString(spender),
    {
      coins,
    },
  );
  console.log('Estimation: ', estimation);

  const operation = await contract.call(
    'asyncSendFT',
    new Args().addSerializable(schedule).serialize(),
    { coins },
  );
  const events = console.log(await operation.getSpeculativeEvents());
}

async function create() {
  const { contract } = await getClientAndContract(contractAddress);

  const operation = await contract.call(
    'startScheduleSendFT',
    new Args().addSerializable(schedule).serialize(),
    { coins },
  );

  console.log('op id', operation.id);

  await operation.waitSpeculativeExecution();
  console.log('done');
  const events = await operation.getSpeculativeEvents();
  for (const event of events) {
    console.log('Event: ', event.data);
  }
}

async function main() {
  // contractAddress = await deploy();
  await create();
  // await send();
}

main();
