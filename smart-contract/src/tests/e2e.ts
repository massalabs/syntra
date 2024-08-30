import { scheduler } from 'node:timers/promises';
import {
  Account,
  Args,
  EventPoller,
  formatMas,
  formatUnits,
  JsonRPCClient,
  Mas,
  parseMas,
  parseUnits,
  SCEvent,
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
import { getBallanceOf, logBalances } from '../token/read';

import * as dotenv from 'dotenv';
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

export async function run(isMas: boolean) {
  const client = JsonRPCClient.buildnet();
  const { provider, spender, recipient } = await setupAccounts();

  let tokenAddress;
  const tokenDecimals = 18;
  if (!isMas) {
    const tokenArgs = new Args()
      .addString('MassaTips')
      .addString('MT')
      .addU8(BigInt(tokenDecimals))
      .addU256(parseUnits('120000000', tokenDecimals));

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
    isMas ? parseMas('1') : parseUnits('1', tokenDecimals),
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
  const recipientInitBal = isMas ? await client.getBalance(recipient) : 0n;
  const spenderInitBal = isMas
    ? await client.getBalance(spender)
    : await getBallanceOf(schedule.tokenAddress, spender);

  const initBalance = await client.getBalance(schedulerAddress, false);

  await create(schedulerAddress, schedule);

  const schedBal = await client.getBalance(schedulerAddress, false);

  console.log('Scheduler init balance:', formatMas(initBalance));
  console.log('Scheduler balance after create:', formatMas(schedBal));

  if (initBalance > schedBal) {
    throw new Error('Scheduler contract should keep its coins!');
  }

  console.log(
    'Schedule created',
    `current period: ${await client.fetchPeriod()}`,
  );

  let stop = false;
  let currentOccurrence: bigint | undefined;
  const allEvents: SCEvent[] = [];
  const onData = async (events: SCEvent[]) => {
    allEvents.push(...events);

    // regex to match the event and extract the remaining occurrences (2 group)
    const transferRegex = /Transfer:(\d+),(\d+),(\d+),(\d+)/;

    events.forEach((e) => {
      const match = e.data.match(transferRegex);
      if (match) {
        currentOccurrence = schedule.occurrences - BigInt(match[2]);
      }
    });
    if (!currentOccurrence) {
      return;
    }
    separator();

    console.log(
      `Iteration ${currentOccurrence.toString()}: current period: ${await client.fetchPeriod()}`,
    );

    const schedules = await getSchedulesBySpender(schedulerAddress, spender);
    schedules.forEach(async (schedule, _idx) => {
      console.table({
        id: schedule.id,
        recipient: schedule.recipient,
        amount: schedule.amount,
        remaining: schedule.remaining,
        occurrences: schedule.occurrences,
      });
    });

    console.table(allEvents.map((e) => e.data));

    // Test balances
    if (isMas) {
      const spenderBalance = await client.getBalance(spender, false);
      const recipientBalance = await client.getBalance(recipient, false);
      console.log('Spender balance:', formatMas(spenderBalance));
      console.log('Recipient balance:', formatMas(recipientBalance));
      console.log('Recipient init balance:', formatMas(recipientInitBal));
      console.log(
        'expected Recipient balance:',
        formatMas(recipientInitBal + schedule.amount * currentOccurrence),
      );
      if (
        recipientBalance !==
        recipientInitBal + schedule.amount * currentOccurrence
      ) {
        throw new Error('Wrong recipient balance');
      }
    } else {
      const spenderBalance = await getBallanceOf(
        schedule.tokenAddress,
        spender,
      );
      const recipientBalance = await getBallanceOf(
        schedule.tokenAddress,
        recipient,
      );
      console.log(
        'Spender balance:',
        formatUnits(spenderBalance, tokenDecimals),
      );
      console.log(
        'Recipient balance:',
        formatUnits(recipientBalance, tokenDecimals),
      );
      if (
        recipientBalance !==
        recipientInitBal + schedule.amount * currentOccurrence
      ) {
        throw new Error('Wrong recipient balance');
      }
      if (
        spenderBalance !==
        spenderInitBal - schedule.amount * currentOccurrence
      ) {
        throw new Error('Wrong spender balance');
      }
    }
    if (currentOccurrence === schedule.occurrences) {
      stop = true;
    }
  };

  const onError = (error: Error) => {
    console.error('Error:', error);
    stop = true;
  };
  const { stopPolling } = EventPoller.start(
    provider,
    {
      smartContractAddress: schedulerAddress,
    },
    onData,
    onError,
    5000,
  );

  while (!stop) {
    await scheduler.wait(periodsToMilliseconds(0.5));
  }
  stopPolling();
  if (currentOccurrence !== schedule.occurrences) {
    throw new Error('Wrong number of occurrences');
  }
}
