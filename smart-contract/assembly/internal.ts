import {
  Address,
  Context,
  generateEvent,
  sendMessage,
  Storage,
} from '@massalabs/massa-as-sdk';
import { TokenWrapper } from '@massalabs/sc-standards/assembly/contracts/FT';
import { u256 } from 'as-bignum/assembly';
import { Schedule, Transfer } from './Schedule';
import {
  Args,
  bytesToU64,
  stringToBytes,
  u64ToBytes,
} from '@massalabs/as-types';

// Token helpers
export function checkAllowance(
  tokenAddress: string,
  spender: string,
  amount: u256,
): void {
  const coin = new TokenWrapper(new Address(tokenAddress));
  const allowance = coin.allowance(new Address(spender), Context.callee());
  assert(allowance < amount, 'Not enough allowance');
}

export function sendFT(schedule: Schedule): void {
  const coin = new TokenWrapper(new Address(schedule.tokenAddress));
  coin.transferFrom(
    new Address(schedule.spender),
    new Address(schedule.recipient),
    schedule.amount,
  );
}

// Autonomous smart contract feature

// The function asyncSendFT will be trigger by autonomous smart contract feature.
export function asyncSendFT(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const schedule = args
    .nextSerializable<Schedule>()
    .expect('Schedule is missing or invalid');
  // send token
  sendFT(schedule);

  // update schedule
  schedule.remaining -= 1;
  const period = Context.currentPeriod();
  const thread = Context.currentThread();
  schedule.history.push(new Transfer(period));
  updateSchedule(schedule);

  // event
  generateEvent(schedule.createTransferEvent(period, thread));
}

export function scheduleAllSendFT(schedule: Schedule): void {
  for (let n: u64 = 1; n <= schedule.occurrences; n++) {
    sendMessage(
      Context.callee(),
      'asyncSendFT',
      Context.currentPeriod() + schedule.interval * n - schedule.tolerance,
      Context.currentThread(),
      Context.currentPeriod() + schedule.interval * n + schedule.tolerance,
      Context.currentThread(),
      5016458,
      0,
      0, // TODO: calibrate coins depending on the presence of the recipient balance in the token storage
      new Args().add(schedule).serialize(),
    );
  }
}

// Storage

const recipientsPrefix = 'RECIPIENT';
const schedulesPrefix = 'SCHEDULE';

export const idCounterKey = stringToBytes('C');

function getIdCounter(): u64 {
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
  const id = incrementIdCounter();
  const key = getScheduleKey(schedule.spender, id);
  schedule.id = id;
  Storage.set(key, new Args().add(schedule).serialize());

  Storage.set(getRecipientKey(schedule.recipient, id), key);
}

export function updateSchedule(schedule: Schedule): void {
  const key = getScheduleKey(schedule.spender, schedule.id);
  Storage.set(key, new Args().add(schedule).serialize());
}

export function removeSchedule(spender: string, id: u64): void {
  const key = getScheduleKey(spender, id);
  const schedule = new Args(Storage.get(key))
    .nextSerializable<Schedule>()
    .unwrap();
  Storage.del(key);

  const recipientKey = getRecipientKey(schedule.recipient, id);
  Storage.del(recipientKey);
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
