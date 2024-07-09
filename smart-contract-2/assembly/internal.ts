import {
  Address,
  Context,
  sendMessage,
  Storage,
} from '@massalabs/massa-as-sdk';
import { TokenWrapper } from '@massalabs/sc-standards/assembly/contracts/FT';
import { u256 } from 'as-bignum/assembly';
import { Schedule } from './Schedule';
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

// The function nextSendFT will be trigger by autonomous smart contract feature.
export function nextSendFT(schedule: Schedule): void {
  sendFT(schedule);
  schedule.times -= 1;
  updateSchedule(schedule);
  if (schedule.times > 0) {
    scheduleSendFT(schedule);
  }
}

export function scheduleSendFT(schedule: Schedule): void {
  sendMessage(
    Context.callee(),
    'nextSendFT',
    Context.currentPeriod() + schedule.interval - schedule.tolerance,
    Context.currentThread(),
    Context.currentPeriod() + schedule.interval + schedule.tolerance,
    Context.currentThread(),
    40000000, // TODO: calibrate max gas
    0,
    0, // TODO: calibrate coins depending on the presence of the recipient balance in the token storage
    new Args().add(schedule).serialize(),
  );
}

// Storage

const schedulesPrefix = 'SCHEDULE';

export const counterKey = stringToBytes('C');

function getCounter(): u64 {
  return bytesToU64(Storage.get(counterKey));
}

function incrementCounter(): void {
  const counter = getCounter();
  Storage.set(counterKey, u64ToBytes(counter + 1));
}

function getSchedulePrefix(spender: string): StaticArray<u8> {
  return stringToBytes(schedulesPrefix + spender);
}

function getScheduleKey(spender: string, id: u64): StaticArray<u8> {
  return getSchedulePrefix(spender).concat(u64ToBytes(id));
}

export function pushSchedule(schedule: Schedule): void {
  incrementCounter();
  const id = getCounter();
  const key = getScheduleKey(schedule.spender, id);
  schedule.id = id;
  Storage.set(key, new Args().add(schedule).serialize());
}

export function updateSchedule(schedule: Schedule): void {
  const key = getScheduleKey(schedule.spender, schedule.id);
  Storage.set(key, new Args().add(schedule).serialize());
}

export function removeSchedule(spender: string, id: u64): void {
  const key = getScheduleKey(spender, id);
  Storage.del(key);
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
