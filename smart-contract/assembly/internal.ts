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

// The function asyncSend will be trigger by autonomous smart contract feature.
export function asyncSend(binaryArgs: StaticArray<u8>): void {
  // deserialize params
  const args = new Args(binaryArgs);
  const spender = args.next<string>().expect('spender is missing or invalid');
  const id = args.next<u64>().expect('id is missing or invalid');

  // read storage
  const key = getScheduleKey(spender, id);
  assert(Storage.has(key), `Schedule ${id.toString()} not found or canceled`);

  const schedule = new Args(Storage.get(key))
    .nextSerializable<Schedule>()
    .unwrap();

  // assert ASC or that the caller is the spender
  assert(
    Context.callee() === Context.caller() ||
      Context.caller() === new Address(schedule.spender),
    'Unauthorized',
  );

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
  schedule.history.push(new Transfer(period));

  updateSchedule(schedule);

  // event
  generateEvent(schedule.createTransferEvent(period, thread));
}

export function scheduleAllSend(schedule: Schedule): void {
  for (let n: u64 = 1; n <= schedule.occurrences; n++) {
    const validityStartPeriod =
      Context.currentPeriod() + schedule.interval * n - schedule.tolerance;
    const validityStartThread = Context.currentThread();
    const validityEndPeriod =
      Context.currentPeriod() + schedule.interval * n + schedule.tolerance + 1; // +1 because validity-end is exclusive
    const validityEndThread = Context.currentThread();
    sendMessage(
      Context.callee(),
      'asyncSend',
      validityStartPeriod,
      validityStartThread,
      validityEndPeriod,
      validityEndThread,
      MAX_GAS_ASYNC_FT,
      1_000_000,
      // no need to transfer coins, as function is on the same contract
      0,
      new Args().add(schedule.spender).add(schedule.id).serialize(),
    );
    generateEvent(
      schedule.createDispatchEvent(
        n,
        validityStartPeriod,
        validityStartThread,
        validityEndPeriod,
        validityEndThread,
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

  assert(
    !schedule.isVesting || !schedule.remaining,
    'Vesting schedules cannot be canceled',
  );

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

export function readSchedule(spender: string, id: u64): StaticArray<u8> {
  const key = getScheduleKey(spender, id);
  return Storage.get(key);
}
