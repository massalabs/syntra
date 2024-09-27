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
  getScheduleData,
  getSchedule as _getSchedule,
  processTask,
} from '../internal';
import { setOwner } from '@massalabs/sc-standards/assembly/contracts/utils/ownership';
import { refundMas } from '../refund';
export {
  ownerAddress,
  setOwner,
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership';

export function constructor(_: StaticArray<u8>): void {
  assert(Context.isDeployingContract());
  setOwner(new Args().add(Context.caller()).serialize());
  Storage.set(idCounterKey, u64ToBytes(0));
}

// Write

export function startScheduleSend(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);

  const initBal = balance();

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

    checkAllowance(
      schedule.tokenAddress,
      schedule.spender,
      // @ts-ignore
      // TODO: use SafeMathU256
      schedule.amount * u256.fromU64(schedule.occurrences),
    );
  } else {
    // if Mas is used, vesting mode is mandatory
    assert(schedule.isVesting, 'Vesting mode is mandatory to use Mas');
  }

  schedule.remaining = schedule.occurrences;

  schedule.history = [];

  const operationId = getOriginOperationId();
  // operation id is null for readonly calls
  if (operationId) {
    schedule.operationId = operationId;
  }

  pushSchedule(schedule);

  // process the first task synchronously
  processTask(schedule, 0);

  scheduleAllSend(schedule);

  generateEvent(schedule.createCreationEvent());

  refundMas(schedule, initBal);
}

// cancelScheduleSend will make all the remaining transfers of the schedule fail because the schedule will be removed.
// and the async call try to read the schedule will fail.
export function cancelSchedules(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);

  const ids = args.next<u64[]>().expect('Ids are missing or invalid');

  const spender = Context.caller().toString();

  for (let i = 0; i < ids.length; i++) {
    removeSchedule(spender, ids[i]);
  }
  // TODO - implement refund ?
}

export function selfTrigger(binaryArgs: StaticArray<u8>): void {
  assert(
    Context.callee() === Context.caller(),
    'The caller must be the contract itself',
  );
  const args = new Args(binaryArgs);
  const spender = args.next<string>().expect('spender is missing or invalid');
  const id = args.next<u64>().expect('id is missing or invalid');
  const taskIndex = args
    .next<u64>()
    .expect('schedule task index is missing or invalid');
  const schedule = _getSchedule(spender, id);
  processTask(schedule, taskIndex);
}

export function manualTrigger(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const spender = args.next<string>().expect('spender is missing or invalid');
  const id = args.next<u64>().expect('id is missing or invalid');

  const schedule = _getSchedule(spender, id);
  assert(
    Context.caller() === new Address(schedule.spender) ||
      (schedule.isVesting &&
        Context.caller() === new Address(schedule.recipient)),
    'Manual trigger should be called by the spender or the recipient for vesting schedules',
  );

  let missingTaskIndex: u64 = 0;
  // find the first not processed task
  while (missingTaskIndex < schedule.occurrences) {
    let found = false;
    for (let i = 0; i < schedule.history.length; i++) {
      // last processed task
      const task = schedule.history[i];
      if (task.taskIndex === missingTaskIndex) {
        // task has been processed
        missingTaskIndex++;
        found = true;
        break;
      }
    }
    if (!found) {
      break;
    }
  }

  // check if the next task is ready to process at the current period
  // The period we can consider the task is actually missed
  const expectedTaskPeriod =
    schedule.history[0].period +
    schedule.interval * missingTaskIndex +
    schedule.tolerance;

  assert(
    Context.currentPeriod() > expectedTaskPeriod,
    'Next task is not ready yet',
  );

  processTask(schedule, missingTaskIndex);
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

  return getScheduleData(spender, id);
}
