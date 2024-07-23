import { Account, JsonRPCClient, Mas } from '@massalabs/massa-web3';
import { create } from '../create';
import { deploy } from '../lib-deploy';
import { Schedule } from '../Schedule';
import { increaseAllowance } from '../allowance';
import { getSchedulesBySpender } from '../read';

import * as dotenv from 'dotenv';
import assert from 'assert';
dotenv.config();

async function main() {
  const client = JsonRPCClient.buildnet();
  const account = await Account.fromEnv();
  const { contractAddress } = await deploy();
  let events;
  const spender = 'AU1Bknx3Du4aiGiHaeh1vo7LfwEPRF3piAwotRkdK975qCBxWwLs'; // your address corresponding to the .env pk
  const tokenAddress = 'AS12FW5Rs5YN2zdpEnqwj4iHUUPt9R4Eqjq2qtpJFNKW3mn33RuLU'; // WMAS buildnet,
  const schedule = new Schedule(
    0n,
    tokenAddress,
    spender,
    'AU1wN8rn4SkwYSTDF3dHFY4U28KtsqKL1NnEjDZhHnHEy6cEQm53', // buildnet main account,
    Mas.fromString('0.1'),
    2n,
    4n,
  );

  events = await increaseAllowance(
    client,
    account,
    tokenAddress,
    contractAddress,
    schedule.amount * schedule.occurrences,
  );
  events.map((event) => console.log('Event: ', event.data));

  events = await create(contractAddress, schedule);
  events.map((event) => console.log('Event: ', event.data));

  const schedules = await getSchedulesBySpender(contractAddress, spender);
  assert(schedules.length === 1);
}

main();
