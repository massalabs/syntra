import { scheduler } from 'node:timers/promises';
import { Account, Args, JsonRPCClient, Mas } from '@massalabs/massa-web3';
import { create } from '../create';
import { deploy } from '../lib-deploy';
import { Schedule } from '../Schedule';
import { increaseAllowance } from '../token/allowance';
import { getSchedulesBySpender } from '../read';
import {
  getEnvVariable,
  logEvents,
  periodsToSeconds,
  separator,
} from '../utils';
import { logBalances } from '../token/read';

import * as dotenv from 'dotenv';
dotenv.config();

async function setupAccounts() {
  const account = await Account.fromEnv();
  const recipient = getEnvVariable('RECIPIENT_ADDRESS');
  return {
    account,
    spender: account.address.toString(),
    recipient,
  };
}

async function main() {
  const client = JsonRPCClient.buildnet();
  const { account, spender, recipient } = await setupAccounts();

  const tokenArgs = new Args()
    .addString('MassaTips')
    .addString('MT')
    .addU8(0n)
    .addU256(1000000000n);

  const { contractAddress: tokenAddress } = await deploy(
    'token.wasm',
    tokenArgs,
    Mas.fromString('1'),
  );

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
    1n,
    1n,
    1n,
    1n,
    1n,
  );

  const allowanceEvents = await increaseAllowance(
    client,
    account,
    tokenAddress,
    schedulerAddress,
    schedule.amount * schedule.occurrences,
  );
  console.log('Allowance increased');
  logEvents(allowanceEvents);

  const createEvents = await create(schedulerAddress, schedule);
  console.log(
    'Schedule created',
    `current period: ${await client.fetchPeriod()}`,
  );
  logEvents(createEvents);

  for (let i = 0; i < 10; i++) {
    separator();
    await scheduler.wait(periodsToSeconds(Number(schedule.occurrences)));
    console.log(
      `Iteration ${i + 1}:`,
      `current period: ${await client.fetchPeriod()}`,
    );
    const schedules = await getSchedulesBySpender(schedulerAddress, spender);
    schedules.forEach((schedule, idx) =>
      console.log(
        // eslint-disable-next-line max-len
        `Schedule ${idx}: id: ${schedule.id} recipient: ${schedule.recipient}, amount: ${schedule.amount}, remaining: ${schedule.remaining}, occurrences: ${schedule.occurrences}`,
      ),
    );
    await logBalances(tokenAddress, spender, recipient);
    const events = await client.getEvents({
      smartContractAddress: schedulerAddress,
      isFinal: true,
    });
    logEvents(events);
  }
}

main().catch(console.error);
