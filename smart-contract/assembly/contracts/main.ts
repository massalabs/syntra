// The entry file of your WebAssembly module.
import { Address, Context, Storage } from '@massalabs/massa-as-sdk';
import { Args, u64ToBytes } from '@massalabs/as-types';
import { u256 } from 'as-bignum/assembly';
import { Schedule } from '../Schedule';
import {
  checkAllowance,
  scheduleAllSendFT,
  pushSchedule,
  readSchedulesBySpender,
  removeSchedule,
  idCounterKey,
  readSchedule,
} from '../internal';

export { asyncSendFT } from '../internal';

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
  const schedule = args
    .nextSerializable<Schedule>()
    .expect('Schedule is missing or invalid');
  checkAllowance(
    schedule.tokenAddress,
    schedule.spender,
    amount * u256.fromU64(occurrences), // TODO: use SafeMathU256
  );
  scheduleAllSendFT(schedule);
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
