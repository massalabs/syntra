import { scheduler } from 'node:timers/promises';
import {
  Account,
  Args,
  JsonRPCClient,
  Mas,
  parseMas,
  parseUnits,
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
dotenv.config();

const isMas = false;

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

  let tokenAddress;
  if (!isMas) {
    const tokenArgs = new Args()
      .addString('MassaTips')
      .addString('MT')
      .addU8(18n)
      .addU256(120000000n * 10n ** 18n);

    const { contractAddress } = await deploy(
      'token.wasm',
      tokenArgs,
      Mas.fromString('1'),
    );
    tokenAddress = contractAddress;
  }

  const { contractAddress: schedulerAddress } = await deploy(
    'main.wasm',
    new Args(),
    Mas.fromString('1'),
  );

  const schedule = new Schedule(
    0n,
    isMas ? true : false,
    isMas ? '' : tokenAddress,
    spender,
    recipient,
    isMas ? parseMas('1') : parseUnits('1', 18),
    10n,
    4n,
    4n,
    3n,
  );

  if (!isMas) {
    const allowanceEvents = await increaseAllowance(
      provider,
      tokenAddress!,
      schedulerAddress,
      schedule.amount * schedule.occurrences,
    );
    console.log('Allowance increased');
    logEvents(allowanceEvents);

    // get token info and balance
    logBalances(tokenAddress!, spender, recipient);
  }
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
    if (isMas) {
      const spenderBalance = await client.getBalance(spender);
      const recipientBalance = await client.getBalance(recipient);
      console.log('Spender balance:', spenderBalance.toString());
      console.log('Recipient balance:', recipientBalance.toString());
    } else {
      await logBalances(tokenAddress!, spender, recipient);
    }
    const events = await client.getEvents({
      smartContractAddress: schedulerAddress,
      isFinal: true,
    });

    console.table(events.map((e) => e.data));
  }
}

main().catch(console.error);
