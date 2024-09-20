import {
  currentPeriod,
  currentThread,
  mockAdminContext,
  mockCurrentSlot,
  mockScCall,
  resetStorage,
} from '@massalabs/massa-as-sdk';
import {
  admin,
  contractAddress,
  createSchedule,
  interval,
  occurrences,
  spender1,
  switchUser,
  tolerance,
} from './utils';
import {
  constructor,
  getSchedulesBySpender,
  manualTrigger,
  selfTrigger,
} from '../contracts/main';
import { Args } from '@massalabs/as-types';
import { Schedule } from '../Schedule';
import { getIdCounter } from '../internal';

beforeEach(() => {
  resetStorage();
  mockAdminContext(true);
  switchUser(admin);
  constructor([]);
  mockAdminContext(false);
  switchUser(spender1);
});

describe('Missed task tests', () => {
  throws('Fail to trigger because task is not ready', () => {
    createSchedule();
    const scheduleId = getIdCounter();

    manualTrigger(new Args().add(spender1).add(scheduleId).serialize());
  });

  test('last task is missing, process manual trigger', () => {
    let startPeriod = currentPeriod();
    let thread = currentThread();
    createSchedule();

    const schedule = new Args(
      getSchedulesBySpender(new Args().add(spender1).serialize()),
    )
      .nextSerializableObjectArray<Schedule>()
      .unwrap()[0];

    expect(schedule.remaining).toBe(occurrences - 1);
    expect(schedule.history.length).toBe(1);
    expect(schedule.history[0].taskIndex).toBe(0);
    expect(schedule.history[0].period).toBe(startPeriod);
    expect(schedule.history[0].thread).toBe(thread);

    // prepare async call context
    mockScCall([]);
    const triggerPeriod = startPeriod + interval + tolerance + 1;
    mockCurrentSlot(triggerPeriod, thread);

    manualTrigger(
      new Args().add(schedule.spender).add(schedule.id).serialize(),
    );

    const schedules = new Args(
      getSchedulesBySpender(new Args().add(spender1).serialize()),
    )
      .nextSerializableObjectArray<Schedule>()
      .unwrap();

    const scheduleIndex: u64 = 1;
    expect(schedules).toHaveLength(1);
    expect(schedules[0].remaining).toBe(occurrences - 2);
    expect(schedules[0].history.length).toBe(2);
    expect(schedules[0].history[1].taskIndex).toBe(scheduleIndex);
    expect(schedules[0].history[1].period).toBe(triggerPeriod);
    expect(schedules[0].history[1].thread).toBe(thread);
  });

  test('2nd task is missing', () => {
    let startPeriod = currentPeriod();
    let thread = currentThread();
    createSchedule();
    const scheduleId = getIdCounter();

    // prepare async call context
    // triggering the 3rd task
    switchUser(contractAddress);
    mockScCall([]);
    // jump to the 3rd task period
    const triggerPeriod = startPeriod + interval * 2;
    mockCurrentSlot(triggerPeriod, thread);

    let scheduleIndex: u64 = 2;

    selfTrigger(
      new Args().add(spender1).add(scheduleId).add(scheduleIndex).serialize(),
    );

    let schedules = new Args(
      getSchedulesBySpender(new Args().add(spender1).serialize()),
    )
      .nextSerializableObjectArray<Schedule>()
      .unwrap();

    expect(schedules).toHaveLength(1);
    expect(schedules[0].remaining).toBe(occurrences - 2);
    expect(schedules[0].history.length).toBe(2);
    expect(schedules[0].history[1].taskIndex).toBe(scheduleIndex);
    expect(schedules[0].history[1].period).toBe(triggerPeriod);
    expect(schedules[0].history[1].thread).toBe(thread);

    // prepare manual trigger context to process missed task
    switchUser(spender1);
    mockScCall([]);

    manualTrigger(new Args().add(spender1).add(scheduleId).serialize());

    schedules = new Args(
      getSchedulesBySpender(new Args().add(spender1).serialize()),
    )
      .nextSerializableObjectArray<Schedule>()
      .unwrap();

    scheduleIndex = 1;
    expect(schedules).toHaveLength(1);
    expect(schedules[0].remaining).toBe(occurrences - 3);
    expect(schedules[0].history.length).toBe(3);
    expect(schedules[0].history[2].taskIndex).toBe(scheduleIndex);
    expect(schedules[0].history[2].period).toBe(triggerPeriod);
    expect(schedules[0].history[2].thread).toBe(thread);
  });

  test('2nd and 3rd task are missing', () => {
    let startPeriod = currentPeriod();
    let thread = currentThread();
    createSchedule();
    const scheduleId = getIdCounter();

    // prepare async call context
    // triggering the 3rd task
    switchUser(contractAddress);
    mockScCall([]);
    // jump to the 4th task period
    const triggerPeriod = startPeriod + interval * 3;
    mockCurrentSlot(triggerPeriod, thread);

    let scheduleIndex: u64 = 3;

    selfTrigger(
      new Args().add(spender1).add(scheduleId).add(scheduleIndex).serialize(),
    );

    let schedules = new Args(
      getSchedulesBySpender(new Args().add(spender1).serialize()),
    )
      .nextSerializableObjectArray<Schedule>()
      .unwrap();

    expect(schedules).toHaveLength(1);
    expect(schedules[0].remaining).toBe(occurrences - 2);
    expect(schedules[0].history.length).toBe(2);
    expect(schedules[0].history[1].taskIndex).toBe(scheduleIndex);
    expect(schedules[0].history[1].period).toBe(triggerPeriod);
    expect(schedules[0].history[1].thread).toBe(thread);

    // prepare manual trigger context to process 2nd task
    switchUser(spender1);
    mockScCall([]);

    manualTrigger(new Args().add(spender1).add(scheduleId).serialize());

    schedules = new Args(
      getSchedulesBySpender(new Args().add(spender1).serialize()),
    )
      .nextSerializableObjectArray<Schedule>()
      .unwrap();

    scheduleIndex = 1;
    expect(schedules).toHaveLength(1);
    expect(schedules[0].remaining).toBe(occurrences - 3);
    expect(schedules[0].history.length).toBe(3);
    expect(schedules[0].history[2].taskIndex).toBe(scheduleIndex);
    expect(schedules[0].history[2].period).toBe(triggerPeriod);
    expect(schedules[0].history[2].thread).toBe(thread);

    // prepare manual trigger context to process 3nd task
    mockScCall([]);

    manualTrigger(new Args().add(spender1).add(scheduleId).serialize());

    schedules = new Args(
      getSchedulesBySpender(new Args().add(spender1).serialize()),
    )
      .nextSerializableObjectArray<Schedule>()
      .unwrap();

    scheduleIndex = 2;

    expect(schedules).toHaveLength(1);
    expect(schedules[0].remaining).toBe(occurrences - 4);
    expect(schedules[0].history.length).toBe(4);
    expect(schedules[0].history[3].taskIndex).toBe(scheduleIndex);
    expect(schedules[0].history[3].period).toBe(triggerPeriod);
    expect(schedules[0].history[3].thread).toBe(thread);
  });
});
