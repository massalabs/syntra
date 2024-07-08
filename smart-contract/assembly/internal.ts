import {
  Address,
  Context,
  sendMessage,
  Storage,
} from '@massalabs/massa-as-sdk';
import { TokenWrapper } from '@massalabs/sc-standards/assembly/contracts/FT';
import { u256 } from 'as-bignum/assembly';
import { Schedule } from './Schedule';
import { Args } from '@massalabs/as-types';

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

const schedulesPrefix = 'S';

function getKey(spender: string): StaticArray<u8> {
  return new Args().add(schedulesPrefix + spender).serialize();
}

export function pushSchedule(schedule: Schedule): void {
  const key = getKey(schedule.spender);
  let schedules: Schedule[] = [];
  if (Storage.has(key)) {
    const schedulesData = Storage.get(key);
    schedules = new Args(schedulesData)
      .nextSerializableObjectArray<Schedule>()
      .unwrap();
    const lastSchedule = schedules[schedules.length - 1];
    const newId = lastSchedule.id + 1;
    schedule.id = newId;
    schedules.push(schedule);
  } else {
    schedule.id = 1;
    schedules = [schedule];
  }
  Storage.set(
    key,
    new Args().addSerializableObjectArray(schedules).serialize(),
  );
}

export function updateSchedule(schedule: Schedule): void {
  const key = getKey(schedule.spender);
  const schedulesData = Storage.get(key);
  const schedules = new Args(schedulesData)
    .nextSerializableObjectArray<Schedule>()
    .unwrap();
  const index = schedules.findIndex((s) => s.id === schedule.id);
  schedules[index] = schedule;
  Storage.set(
    key,
    new Args().addSerializableObjectArray(schedules).serialize(),
  );
}

export function removeSchedule(spender: string, id: u64): void {
  const key = getKey(spender);
  const schedules = new Args(Storage.get(key))
    .nextSerializableObjectArray<Schedule>()
    .unwrap();
  const index = schedules.findIndex((s) => s.id === id);
  assert(index !== -1, 'Schedule not found');
  schedules.splice(index, 1);
  Storage.set(
    key,
    new Args().addSerializableObjectArray(schedules).serialize(),
  );
}

export function readSchedulesBySpender(spender: string): StaticArray<u8> {
  const key = getKey(spender);
  if (!Storage.has(key)) {
    return [];
  }

  return Storage.get(key);
}
