import { scheduler } from 'node:timers/promises';
import {
  Account,
  Args,
  EventPoller,
  formatMas,
  formatUnits,
  Mas,
  parseMas,
  parseUnits,
  Web3Provider,
  rpcTypes as t,
  MRC20,
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

async function setupAccounts() {
  const account = await Account.fromEnv();
  const provider = Web3Provider.buildnet(account);
  const recipient = getEnvVariable('RECIPIENT_ADDRESS');
  console.log(
    `Using account ${provider.address}. Balance: ${formatMas(
      await provider.balance(),
    )} MAS`,
  );
  return {
    account,
    provider,
    spender: account.address.toString(),
    recipient,
  };
}

export async function run(isMas: boolean) {
  const { provider, spender, recipient } = await setupAccounts();

  let tokenContract: MRC20;
  const tokenDecimals = 18;
  if (!isMas) {
    console.log('Deploying token contract');
    const tokenArgs = new Args()
      .addString('MassaTips')
      .addString('MT')
      .addU8(BigInt(tokenDecimals))
      .addU256(parseUnits('120000000', tokenDecimals));

    const { contractAddress } = await deploy(
      provider,
      'token.wasm',
      tokenArgs,
      Mas.fromString('1'),
    );
    tokenContract = new MRC20(provider, contractAddress);
  }

  const { contract: schedulerContract } = await deploy(
    provider,
    'main.wasm',
    new Args(),
    Mas.fromString('1'),
  );

  const schedule = new Schedule(
    isMas ? true : false,
    isMas ? '' : tokenContract!.address,
    spender,
    recipient,
    isMas ? parseMas('1') : parseUnits('1', tokenDecimals),
    10n, // interval
    4n, // occurrences
    3n, // tolerance
  );

  if (!isMas) {
    const allowanceEvents = await increaseAllowance(
      provider,
      tokenContract!.address,
      schedulerContract.address,
      schedule.amount * schedule.occurrences,
    );
    console.log('Allowance increased');
    logEvents(allowanceEvents);

    // get token info and balance
    logBalances(tokenContract!, spender, recipient);
  }
  let recipientInitBal;
  if (isMas) {
    const [bal] = await provider.balanceOf([recipient]);
    recipientInitBal = bal.balance;
  } else {
    recipientInitBal = await tokenContract!.balanceOf(recipient);
  }

  const spenderInitBal = isMas
    ? await provider.balance()
    : await tokenContract!.balanceOf(spender);

  const initBalance = await schedulerContract.balance(false);

  await create(schedulerContract, schedule);

  const balanceAfterCreate = await schedulerContract.balance(false);

  console.log('Scheduler init balance:', formatMas(initBalance));
  console.log('Scheduler balance after create:', formatMas(balanceAfterCreate));

  if (initBalance > balanceAfterCreate) {
    throw new Error('Scheduler contract should keep its coins!');
  }

  console.log(
    'Schedule created',
    `current period: ${await provider.client.fetchPeriod()}`,
  );

  let stop = false;
  let taskIndex: bigint | undefined;
  const allEvents: t.OutputEvents = [];
  const onData = async (events: t.OutputEvents) => {
    allEvents.push(...events);

    // regex to match the event and extract the occurrences index
    const transferRegex = /Transfer:(\d+),(\d+),(\d+),(\d+),(\d+)/;

    events.forEach((e) => {
      const match = e.data.match(transferRegex);
      if (match) {
        taskIndex = BigInt(match[2]);
      }
    });

    if (!taskIndex) {
      return;
    }
    separator();

    console.log(
      `Iteration ${taskIndex.toString()}: current period: ${await provider.client.fetchPeriod()}`,
    );

    const schedules = await getSchedulesBySpender(schedulerContract, spender);
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

    const currentOccurrence = taskIndex + 1n;
    // Test balances
    if (isMas) {
      const spenderBalance = await provider.balance(false);
      const [recipientBalance] = await provider.balanceOf([recipient], false);
      console.log('Spender balance:', formatMas(spenderBalance));
      console.log('Recipient balance:', formatMas(recipientBalance.balance));
      console.log('Recipient init balance:', formatMas(recipientInitBal!));
      console.log(
        'expected Recipient balance:',
        formatMas(recipientInitBal! + schedule.amount * currentOccurrence),
      );
      if (
        recipientBalance.balance !==
        recipientInitBal! + schedule.amount * currentOccurrence
      ) {
        throw new Error('Wrong recipient balance');
      }
    } else {
      const spenderBalance = await tokenContract.balanceOf(spender);
      const recipientBalance = await tokenContract.balanceOf(recipient);
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
        recipientInitBal! + schedule.amount * currentOccurrence
      ) {
        throw new Error('Wrong recipient balance');
      }
      if (
        spenderBalance !==
        spenderInitBal! - schedule.amount * currentOccurrence
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
      smartContractAddress: schedulerContract.address,
    },
    onData,
    onError,
    5000,
  );

  while (!stop) {
    await scheduler.wait(periodsToMilliseconds(0.5));
  }
  stopPolling();
  if (taskIndex !== schedule.occurrences - 1n) {
    throw new Error('Wrong number of occurrences');
  }
}
