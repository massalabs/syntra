// The entry file of your WebAssembly module.
import {
  Address,
  balance,
  Context,
  generateEvent,
  getOriginOperationId,
  Storage,
} from '@massalabs/massa-as-sdk';
import { Args, u64ToBytes } from '@massalabs/as-types';
import { u256 } from 'as-bignum/assembly';
import { Schedule } from '../Schedule';
import {
  checkAllowance,
  scheduleAllSend,
  pushSchedule,
  readSchedulesBySpender,
  readSchedulesByRecipient,
  removeSchedule,
  idCounterKey,
  readSchedule,
} from '../internal';
import { setOwner } from '@massalabs/sc-standards/assembly/contracts/utils/ownership';
import { refundMas } from '../refund';
export {
  ownerAddress,
  setOwner,
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership';

export { asyncSend } from '../internal';

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

  setOwner(new Args().add(Context.caller()).serialize());

  Storage.set(idCounterKey, u64ToBytes(0));
  return [];
}

// Write

export function startScheduleSend(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);

  let initBal = balance();
  generateEvent('init balance coins' + initBal.toString());
  const schedule = args
    .nextSerializable<Schedule>()
    .expect('Schedule is missing or invalid');

  assert(Context.caller() === new Address(schedule.spender), 'Unauthorized');
  assert(
    schedule.recipient !== schedule.spender,
    'Recipient and spender must be different',
  );

  if (schedule.tokenAddress.length) {
    // to remove when implemented
    assert(!schedule.isVesting, 'Vesting mode is not implemented for FT');
    // @ts-ignore
    const totalAmount: u256 =
      // @ts-ignore
      // TODO: use SafeMathU256
      schedule.amount * u256.fromU64(schedule.occurrences);
    checkAllowance(schedule.tokenAddress, schedule.spender, totalAmount);
  } else {
    // if Mas is used, vesting mode is mandatory
    assert(schedule.isVesting, 'Vesting mode is mandatory to use Mas');
  }

  schedule.remaining = schedule.occurrences;

  schedule.history = [];

  schedule.operationId = getOriginOperationId()!;

  pushSchedule(schedule);
  scheduleAllSend(schedule);
  generateEvent(schedule.createCreationEvent());

  refundMas(schedule, initBal);
}

// cancelScheduleSend will make all the remaining transfers of the schedule fail because the schedule will be removed.
// and the async call try to read the schedule will fail.
export function cancelSchedules(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const spender = args
    .nextString()
    .expect('Spender address is missing or invalid');

  const ids = args.next<u64[]>().expect('Ids are missing or invalid');

  assert(Context.caller() === new Address(spender), 'Unauthorized');

  for (let i = 0; i < ids.length; i++) {
    removeSchedule(spender, ids[i]);
  }
  // TODO - implement refund ?
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

export function getScheduleByRecipient(
  binaryArgs: StaticArray<u8>,
): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const recipient = args
    .nextString()
    .expect('Recipient address is missing or invalid');

  return readSchedulesByRecipient(recipient);
}

export function getSchedule(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const spender = args
    .nextString()
    .expect('Spender address is missing or invalid');
  const id = args.nextU64().expect('Id is missing or invalid');

  return readSchedule(spender, id);
}
