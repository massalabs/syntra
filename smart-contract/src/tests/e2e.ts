import { scheduler } from 'node:timers/promises';
import { Account, Args, JsonRPCClient, Mas, U128 } from '@massalabs/massa-web3';
import * as dotenv from 'dotenv';
import { create } from '../create';
import { deploy } from '../lib-deploy';
import { Schedule } from '../Schedule';
import { increaseAllowance } from '../allowance';
import { getSchedulesBySpender } from '../read';
import { periodsToSeconds, separator } from '../utils';
import { mint } from '../token/mint';
import { logBalances } from '../token/read';

dotenv.config();

async function setupAccounts() {
  const account = await Account.fromEnv();
  const recipientAccount = await Account.fromEnv('RECIPIENT_PK');
  return {
    account,
    recipientAccount,
    spender: account.address.toString(),
    recipient: recipientAccount.address.toString(),
  };
}

async function main() {
  const client = JsonRPCClient.buildnet();
  const { account, spender, recipient } = await setupAccounts();

  const tokenArgs = new Args()
    .addString('MassaTips')
    .addString('MT')
    .addU8(18n)
    .addU256(0n);

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
    Mas.fromString('0.1'),
    1n,
    0n,
  );

  const mintEvents = await mint(
    client,
    account,
    tokenAddress,
    account.address.toString(),
    U128.MAX,
  );
  console.log('Token minted');
  mintEvents.forEach((event) => console.log('Event: ', event.data));

  const allowanceEvents = await increaseAllowance(
    client,
    account,
    tokenAddress,
    schedulerAddress,
    schedule.amount * schedule.occurrences,
  );
  console.log('Allowance increased');
  allowanceEvents.forEach((event) => console.log('Event: ', event.data));

  const createEvents = await create(schedulerAddress, schedule);
  console.log('Schedule created');
  createEvents.forEach((event) => console.log('Event: ', event.data));

  for (let i = 0; i < 5; i++) {
    separator();
    await scheduler.wait(periodsToSeconds(Number(schedule.occurrences)));
    console.log(`Iteration ${i + 1}:`);
    const schedules = await getSchedulesBySpender(schedulerAddress, spender);
    schedules.forEach((schedule, idx) =>
      console.log(
        // eslint-disable-next-line max-len
        `Schedule ${idx}: recipient: ${schedule.recipient}, amount: ${schedule.amount}, remaining: ${schedule.remaining}, occurrences: ${schedule.occurrences}`,
      ),
    );
    await logBalances(tokenAddress, spender, recipient);
    const events = await client.getEvents({
      smartContractAddress: schedulerAddress,
      isFinal: true,
    });
    events.forEach((event, idx) => console.log(`Event ${idx}`, event.data));
  }
}

main().catch(console.error);
