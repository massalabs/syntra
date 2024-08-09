import { scheduler } from 'node:timers/promises';
import {
  Account,
  Args,
  JsonRPCClient,
  Mas,
  Web3Provider,
} from '@massalabs/massa-web3';
import { create } from '../create';
import { deploy } from '../lib-deploy';
import { Schedule } from '../Schedule';
import { increaseAllowance } from '../token/allowance';
import { getSchedulesBySpender } from '../read';
import {
  getEnvVariable,
  logEvents,
  periodsToMilliseconds,
  separator,
} from '../utils';
import { logBalances } from '../token/read';

import * as dotenv from 'dotenv';
import { mint } from '../token/mint';
dotenv.config();

async function setupAccounts() {
  const account = await Account.fromEnv();
  const provider = Web3Provider.buildnet(account);
  const recipient = getEnvVariable('RECIPIENT_ADDRESS');
  return {
    account,
    provider,
    spender: account.address.toString(),
    recipient,
  };
}

async function main() {
  const client = JsonRPCClient.buildnet();
  const { provider, spender, recipient } = await setupAccounts();

  const tokenArgs = new Args()
    .addString('MassaTips')
    .addString('MT')
    .addU8(18n)
    .addU256(120000000n * 10n ** 18n);

  const { contractAddress: tokenAddress } = await deploy(
    'token.wasm',
    tokenArgs,
    Mas.fromString('1'),
  );

  // const events = await mint(provider, tokenAddress, 1000n * 10n ** 18n);
  // logEvents(events);

  const { contractAddress: schedulerAddress } = await deploy(
    'main.wasm',
    new Args(),
    Mas.fromString('1'),
  );

  const schedule = new Schedule(
    0n,
    tokenAddress,
    spender,
    recipient,
    1n * 10n ** 18n,
    10n,
    4n,
    4n,
    3n,
  );

  const allowanceEvents = await increaseAllowance(
    provider,
    tokenAddress,
    schedulerAddress,
    schedule.amount * schedule.occurrences,
  );
  console.log('Allowance increased');
  logEvents(allowanceEvents);

  // get token info and balance
  logBalances(tokenAddress, spender, recipient);

  const createEvents = await create(schedulerAddress, schedule);

  console.log(
    'Schedule created',
    `current period: ${await client.fetchPeriod()}`,
  );
  logEvents(createEvents);

  for (let i = 0; i < schedule.occurrences; i++) {
    separator();

    await scheduler.wait(periodsToMilliseconds(Number(schedule.interval)));

    console.log(
      `Iteration ${i + 1}: current period: ${await client.fetchPeriod()}`,
    );

    const schedules = await getSchedulesBySpender(schedulerAddress, spender);
    schedules.forEach(async (schedule, idx) => {
      console.table({
        id: schedule.id,
        recipient: schedule.recipient,
        amount: schedule.amount,
        remaining: schedule.remaining,
        occurrences: schedule.occurrences,
      });
    });
    await logBalances(tokenAddress, spender, recipient);
    const events = await client.getEvents({
      smartContractAddress: schedulerAddress,
      isFinal: true,
    });

    console.table(events.map((e) => e.data));
  }
}

main().catch(console.error);
