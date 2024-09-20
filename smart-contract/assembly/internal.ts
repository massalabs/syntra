import {
  Address,
  Context,
  generateEvent,
  sendMessage,
  Storage,
  transferCoins,
} from '@massalabs/massa-as-sdk';
import { TokenWrapper } from '@massalabs/sc-standards/assembly/contracts/FT';
import { getBalanceEntryCost } from '@massalabs/sc-standards/assembly/contracts/FT/token-external';
import { u256 } from 'as-bignum/assembly';
import { Schedule, Transfer } from './Schedule';
import {
  Args,
  bytesToU64,
  stringToBytes,
  u64ToBytes,
} from '@massalabs/as-types';

const MAX_GAS_ASYNC_FT = 10_000_000;
export const ASC_FEE = 1_000_000;

// Token helpers
export function checkAllowance(
  tokenAddress: string,
  spender: string,
  amount: u256,
): void {
  const coin = new TokenWrapper(new Address(tokenAddress));

  const allowance = coin.allowance(new Address(spender), Context.callee());

  assert(
    allowance >= amount,
    `Not enough allowance, actual ${allowance}, required ${amount}`,
  );
}

export function sendFT(schedule: Schedule): void {
  const token = new TokenWrapper(new Address(schedule.tokenAddress));
  const coins = getBalanceEntryCost(schedule.tokenAddress, schedule.recipient);

  token.transferFrom(
    new Address(schedule.spender),
    new Address(schedule.recipient),
    schedule.amount,
    coins,
  );
}

// Autonomous smart contract feature

export function processTask(schedule: Schedule, taskIndex: u64): void {
  assert(schedule.remaining > 0, 'No remaining transfers');

  // send token
  if (schedule.tokenAddress.length) {
    sendFT(schedule);
  } else {
    // Mas
    transferCoins(new Address(schedule.recipient), schedule.amount.toU64());
  }

  // update schedule
  schedule.remaining -= 1;
  const period = Context.currentPeriod();
  const thread = Context.currentThread();
  schedule.history.push(new Transfer(period, thread, taskIndex));

  updateSchedule(schedule);

  // event
  generateEvent(schedule.createTransferEvent(taskIndex, period, thread));
}

export function scheduleAllSend(schedule: Schedule): void {
  // schedule the rest of the tasks asynchronously
  for (let taskIndex: u64 = 1; taskIndex < schedule.occurrences; taskIndex++) {
    const validityStartPeriod =
      Context.currentPeriod() +
      schedule.interval * taskIndex -
      schedule.tolerance;
    const validityEndPeriod =
      Context.currentPeriod() +
      schedule.interval * taskIndex +
      schedule.tolerance +
      1; // +1 because validity-end is exclusive

    sendMessage(
      Context.callee(),
      'selfTrigger',
      validityStartPeriod,
      0,
      validityEndPeriod,
      31,
      MAX_GAS_ASYNC_FT,
      ASC_FEE,
      // no need to transfer coins, as function is on the same contract
      0,
      new Args()
        .add(schedule.spender)
        .add(schedule.id)
        .add(taskIndex)
        .serialize(),
    );
    generateEvent(
      schedule.createDispatchEvent(
        taskIndex,
        validityStartPeriod,
        validityEndPeriod,
      ),
    );
  }
}

// Storage

const recipientsPrefix = 'RECIPIENT';
const schedulesPrefix = 'SCHEDULE';

export const idCounterKey = stringToBytes('C');

export function getIdCounter(): u64 {
  return bytesToU64(Storage.get(idCounterKey));
}

function incrementIdCounter(): u64 {
  const counter = getIdCounter();
  const inc = counter + 1;
  Storage.set(idCounterKey, u64ToBytes(inc));
  return inc;
}

export function getRecipientPrefix(recipient: string): StaticArray<u8> {
  return stringToBytes(recipientsPrefix + recipient);
}

export function getRecipientKey(recipient: string, id: u64): StaticArray<u8> {
  return getRecipientPrefix(recipient).concat(u64ToBytes(id));
}

function getSchedulePrefix(spender: string): StaticArray<u8> {
  return stringToBytes(schedulesPrefix + spender);
}

function getScheduleKey(spender: string, id: u64): StaticArray<u8> {
  return getSchedulePrefix(spender).concat(u64ToBytes(id));
}

export function pushSchedule(schedule: Schedule): void {
  schedule.id = incrementIdCounter();
  const key = getScheduleKey(schedule.spender, schedule.id);

  Storage.set(key, new Args().add(schedule).serialize());
  Storage.set(getRecipientKey(schedule.recipient, schedule.id), key);
}

export function updateSchedule(schedule: Schedule): void {
  const key = getScheduleKey(schedule.spender, schedule.id);
  assert(Storage.has(key), `Schedule ${schedule.id.toString()} not found`);
  Storage.set(key, new Args().add(schedule).serialize());
}

export function removeSchedule(spender: string, id: u64): void {
  const scheduleKey = getScheduleKey(spender, id);

  assert(Storage.has(scheduleKey), `Schedule ${id.toString()} not found`);

  const schedule = new Args(Storage.get(scheduleKey))
    .nextSerializable<Schedule>()
    .unwrap();

  assert(!schedule.isVesting, 'Vesting schedules cannot be canceled');

  Storage.del(scheduleKey);
  const recipientKey = getRecipientKey(schedule.recipient, id);
  Storage.del(recipientKey);
  generateEvent(schedule.createCancelEvent());
}

export function readSchedulesBySpender(spender: string): StaticArray<u8> {
  const keyPrefix = getSchedulePrefix(spender);
  const keys = Storage.getKeys(keyPrefix);
  const schedules = new Array<Schedule>(keys.length);
  for (let i = 0; i < keys.length; i++) {
    const data = Storage.get(keys[i]);
    schedules[i] = new Args(data).nextSerializable<Schedule>().unwrap();
  }

  return new Args().addSerializableObjectArray(schedules).serialize();
}

export function readSchedulesByRecipient(recipient: string): StaticArray<u8> {
  const keyPrefix = getRecipientPrefix(recipient);
  const keys = Storage.getKeys(keyPrefix);
  const schedules = new Array<Schedule>(keys.length);
  for (let i = 0; i < keys.length; i++) {
    const scheduleKey = Storage.get(keys[i]);
    const data = Storage.get(scheduleKey);
    schedules[i] = new Args(data).nextSerializable<Schedule>().unwrap();
  }

  return new Args().addSerializableObjectArray(schedules).serialize();
}

export function getScheduleData(spender: string, id: u64): StaticArray<u8> {
  const key = getScheduleKey(spender, id);
  assert(Storage.has(key), `Schedule ${id.toString()} not found or canceled`);
  return Storage.get(key);
}

export function getSchedule(spender: string, id: u64): Schedule {
  const data = getScheduleData(spender, id);
  return new Args(data).nextSerializable<Schedule>().unwrap();
}
