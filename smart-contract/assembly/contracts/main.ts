// The entry file of your WebAssembly module.
import { Address, Context, Storage } from '@massalabs/massa-as-sdk';
import { Args, u64ToBytes } from '@massalabs/as-types';
import { u256 } from 'as-bignum/assembly';
import { Schedule } from '../Schedule';
import {
  checkAllowance,
  scheduleSendFT,
  pushSchedule,
  readSchedulesBySpender,
  removeSchedule,
  idCounterKey,
  readSchedule,
} from '../internal';

export { nextSendFT } from '../internal';

/**
 * This function is meant to be called only one time: when the contract is deployed.
 *
 * @param binaryArgs - Arguments serialized with Args
 */
export function constructor(_: StaticArray<u8>): StaticArray<u8> {
  // This line is important. It ensures that this function can't be called in the future.
  // If you remove this check, someone could call your constructor function and reset your smart contract.
  if (!Context.isDeployingContract()) {
    return [];
  }

  // TODO: initialize ownership

  Storage.set(idCounterKey, u64ToBytes(0));
  return [];
}

// Write

export function startScheduleSendFT(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const tokenAddress = args
    .nextString()
    .expect('Token address is missing or invalid');
  const spender = args
    .nextString()
    .expect('Spender address is missing or invalid');
  const recipient = args
    .nextString()
    .expect('Recipient address is missing or invalid');
  const amount = args.nextU256().expect('Amount is missing or invalid');
  const interval = args.nextU64().expect('Interval is missing or invalid');
  const occurrences = args.nextU64().expect('Times is missing or invalid');
  // tolerance is the number of periods to define the range of the schedule execution
  let tolerance = args.nextU32().unwrapOrDefault();
  if (tolerance === 0) {
    tolerance = 10;
  }
  // @ts-ignore
  // TODO: check overflow ? (or use safeMath)
  checkAllowance(tokenAddress, spender, amount * u256.fromU64(occurrences));

  const schedule = new Schedule(
    0,
    tokenAddress,
    spender,
    recipient,
    amount,
    interval,
    occurrences,
    occurrences,
    tolerance,
  );

  scheduleSendFT(schedule);

  pushSchedule(schedule);
}

export function cancelScheduleSendFT(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const spender = args
    .nextString()
    .expect('Spender address is missing or invalid');
  const id = args.nextU64().expect('Id is missing or invalid');
  assert(Context.caller() === new Address(spender), 'Unauthorized');

  removeSchedule(spender, id);
}

// Read

export function getSchedulesBySpender(
  binaryArgs: StaticArray<u8>,
): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const spender = args
    .nextString()
    .expect('Spender address is missing or invalid');

  return readSchedulesBySpender(spender);
}

export function getSchedule(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const spender = args
    .nextString()
    .expect('Spender address is missing or invalid');
  const id = args.nextU64().expect('Id is missing or invalid');

  return readSchedule(spender, id);
}
