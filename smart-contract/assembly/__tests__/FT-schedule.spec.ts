import {
  cancelSchedules,
  constructor,
  getSchedule,
  getScheduleByRecipient,
  getSchedulesBySpender,
  selfTrigger,
} from '../contracts/main';
import { Args } from '@massalabs/as-types';
import {
  mockAdminContext,
  mockScCall,
  resetStorage,
} from '@massalabs/massa-as-sdk';
import { Schedule } from '../Schedule';
import { getIdCounter } from '../internal';
import {
  admin,
  amount,
  contractAddress,
  createSchedule,
  interval,
  occurrences,
  recipient,
  spender1,
  spender2,
  switchUser,
  tokenAddress,
  tolerance,
} from './utils';

beforeEach(() => {
  resetStorage();
  mockAdminContext(true);
  switchUser(admin);
  constructor([]);
  mockAdminContext(false);
  switchUser(spender1);
});

describe('Scheduler app test', () => {
  test('create FT schedule', () => {
    const currentId = getIdCounter();

    createSchedule();
    const schedulesSer = getSchedulesBySpender(
      new Args().add(spender1).serialize(),
    );

    const schedules = new Args(schedulesSer)
      .nextSerializableObjectArray<Schedule>()
      .unwrap();

    expect(schedules.length).toBe(1);
    expect(schedules[0].id).toBe(currentId + 1);
    expect(schedules[0].isVesting).toBe(false);
    expect(schedules[0].tokenAddress).toBe(tokenAddress);
    expect(schedules[0].spender).toBe(spender1);
    expect(schedules[0].recipient).toBe(recipient);
    expect(schedules[0].amount).toBe(amount);
    expect(schedules[0].interval).toBe(interval);
    expect(schedules[0].occurrences).toBe(occurrences);
    expect(schedules[0].remaining).toBe(occurrences - 1);
    expect(schedules[0].tolerance).toBe(tolerance);
    expect(schedules[0].history.length).toBe(1);
    expect(schedules[0].history[0].taskIndex).toBe(0);

    const schedulesRecipientSer = getScheduleByRecipient(
      new Args().add(recipient).serialize(),
    );
    expect(
      new Args(schedulesRecipientSer)
        .nextSerializableObjectArray<Schedule>()
        .unwrap(),
    ).toStrictEqual(schedules);

    const scheduleSer = getSchedule(
      new Args().add(spender1).add(schedules[0].id).serialize(),
    );
    expect(new Args(scheduleSer).next<Schedule>().unwrap()).toStrictEqual(
      schedules[0],
    );
  });

  test('create 2 FT schedules', () => {
    const currentId = getIdCounter();

    createSchedule();
    createSchedule(); // second schedule

    const schedulesSer = getSchedulesBySpender(
      new Args().add(spender1).serialize(),
    );

    const schedules = new Args(schedulesSer)
      .nextSerializableObjectArray<Schedule>()
      .unwrap();
    expect(schedules.length).toBe(2);
    expect(schedules[0].id).toBe(currentId + 1);
    expect(schedules[1].id).toBe(currentId + 2);

    const schedulesRecipientSer = getScheduleByRecipient(
      new Args().add(recipient).serialize(),
    );
    expect(
      new Args(schedulesRecipientSer)
        .nextSerializableObjectArray<Schedule>()
        .unwrap(),
    ).toStrictEqual(schedules);

    const scheduleSer = getSchedule(
      new Args()
        .add(spender1)
        .add(currentId + 2)
        .serialize(),
    );
    expect(new Args(scheduleSer).next<Schedule>().unwrap()).toStrictEqual(
      schedules[1],
    );
  });

  test('create FT schedule with different spenders', () => {
    const currentId = getIdCounter();

    createSchedule();
    switchUser(spender2);
    createSchedule(spender2); // second schedule

    const schedules = new Args(
      getSchedulesBySpender(new Args().add(spender2).serialize()),
    )
      .nextSerializableObjectArray<Schedule>()
      .unwrap();
    expect(schedules.length).toBe(1);
    expect(
      new Args(getScheduleByRecipient(new Args().add(recipient).serialize()))
        .nextSerializableObjectArray<Schedule>()
        .unwrap().length,
    ).toBe(2);

    const scheduleSer = getSchedule(
      new Args()
        .add(spender2)
        .add(currentId + 2)
        .serialize(),
    );
    expect(new Args(scheduleSer).next<Schedule>().unwrap()).toStrictEqual(
      schedules[0],
    );
  });

  test('process scheduled task send FT', () => {
    createSchedule();
    const schedule = new Args(
      getSchedulesBySpender(new Args().add(spender1).serialize()),
    )
      .nextSerializableObjectArray<Schedule>()
      .unwrap()[0];

    // prepare async call context
    switchUser(contractAddress);
    mockScCall([]);
    let scheduleIndex: u64 = 1;
    // 1st autonomous execution
    selfTrigger(
      new Args()
        .add(schedule.spender)
        .add(schedule.id)
        .add(scheduleIndex)
        .serialize(),
    );
    let schedules = new Args(
      getSchedulesBySpender(new Args().add(spender1).serialize()),
    )
      .nextSerializableObjectArray<Schedule>()
      .unwrap();
    expect(schedules).toHaveLength(1);
    expect(schedules[0].remaining).toBe(occurrences - 2);
    expect(schedules[0].history.length).toBe(2);

    // 2n autonomous execution
    mockScCall([]);
    selfTrigger(
      new Args()
        .add(schedule.spender)
        .add(schedule.id)
        .add(++scheduleIndex)
        .serialize(),
    );
    schedules = new Args(
      getSchedulesBySpender(new Args().add(spender1).serialize()),
    )
      .nextSerializableObjectArray<Schedule>()
      .unwrap();
    expect(schedules).toHaveLength(1);
    expect(schedules[0].remaining).toBe(occurrences - 3);
    expect(schedules[0].history.length).toBe(3);
  });
});

describe('cancelSchedules', () => {
  test('cancel 2 schedules', () => {
    const schedueleId = getIdCounter() + 1;
    createSchedule();
    createSchedule();

    cancelSchedules(new Args().add([schedueleId, schedueleId + 1]).serialize());

    const schedulesSer = getSchedulesBySpender(
      new Args().add(spender1).serialize(),
    );
    expect(
      new Args(schedulesSer).nextSerializableObjectArray<Schedule>().unwrap()
        .length,
    ).toBe(0);

    const schedulesRecipientSer = getScheduleByRecipient(
      new Args().add(recipient).serialize(),
    );
    expect(
      new Args(schedulesRecipientSer)
        .nextSerializableObjectArray<Schedule>()
        .unwrap().length,
    ).toBe(0);

    expect(() => {
      const schedueleId = getIdCounter();
      const params = new Args().add(spender1).add(schedueleId);
      getSchedule(params.serialize());
    }).toThrow();
  });

  throws('fail: unauthorized', () => {
    const schedueleId = getIdCounter() + 1;
    createSchedule();
    switchUser(spender2);
    cancelSchedules(new Args().add([schedueleId]).serialize());
  });

  throws('fail: scheduele not fount', () => {
    createSchedule();
    cancelSchedules(new Args().add([<u64>6666666]).serialize());
  });

  test('multiple create, cancel the first one', () => {
    const schedueleId = getIdCounter() + 1;
    createSchedule();
    createSchedule(); // second schedule

    cancelSchedules(new Args().add([schedueleId]).serialize());

    const schedules = new Args(
      getSchedulesBySpender(new Args().add(spender1).serialize()),
    )
      .nextSerializableObjectArray<Schedule>()
      .unwrap();

    expect(schedules.length).toBe(1);

    const schedulesRecipient = new Args(
      getScheduleByRecipient(new Args().add(recipient).serialize()),
    )
      .nextSerializableObjectArray<Schedule>()
      .unwrap();
    expect(schedulesRecipient).toStrictEqual(schedules);

    const scheduleSer = getSchedule(
      new Args()
        .add(spender1)
        .add(schedueleId + 1)
        .serialize(),
    );

    expect(new Args(scheduleSer).next<Schedule>().unwrap()).toStrictEqual(
      schedules[0],
    );
  });
});
