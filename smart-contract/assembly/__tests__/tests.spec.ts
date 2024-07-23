import {
  asyncSendFT,
  cancelScheduleSendFT,
  constructor,
  getSchedule,
  getScheduleByRecipient,
  getSchedulesBySpender,
  startScheduleSendFT,
} from '../contracts/main';
import { Args, u256ToBytes } from '@massalabs/as-types';
import {
  changeCallStack,
  mockAdminContext,
  mockScCall,
  resetStorage,
} from '@massalabs/massa-as-sdk';
import { u256 } from 'as-bignum/assembly';
import { Schedule } from '../Schedule';

const contractAddress = 'AS12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT';
const admin = 'AU1mhPhXCfh8afoNnbW91bXUVAmu8wU7u8v54yNTMvY7E52KBbz3';
const tokenAddress = 'AS12LpYyAjYRJfYhyu7fkrS224gMdvFHVEeVWoeHZzMdhis7UZ3Eb';
const spender1 = 'AU12NT6c6oiYQhcXNAPRRqDudZGurJkFKcYNLPYSwYkMoEniHv8FW';
const spender2 = 'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq';
const recipient = 'AU12W92UyGW4Bd94BPniTq4Ra5yhiv6RvjazV2G9Q9GyekYkgqbme';
const amount = u256.fromU64(12345678910);
const interval: u64 = 60;
const occurrences: u64 = 10;
const tolerance: u32 = 5;
let id: u64 = 1;

function switchUser(user: string): void {
  changeCallStack(user + ' , ' + contractAddress);
}

beforeEach(() => {
  resetStorage();
  mockAdminContext(true);
  switchUser(admin);
  constructor([]);
  mockAdminContext(false);
  switchUser(spender1);
  id = 1;
});

function createSchedule(spender: string = spender1): void {
  // mock allowance
  mockScCall(u256ToBytes(amount * u256.fromU64(occurrences)));

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

  const params = new Args().add(schedule);

  startScheduleSendFT(params.serialize());
}

describe('Scheduler app test', () => {
  test('startScheduleSendFT', () => {
    createSchedule();

    const schedulesSer = getSchedulesBySpender(
      new Args().add(spender1).serialize(),
    );

    const schedules = new Args(schedulesSer)
      .nextSerializableObjectArray<Schedule>()
      .unwrap();
    expect(schedules.length).toBe(1);
    expect(schedules[0].id).toBe(id);
    expect(schedules[0].tokenAddress).toBe(tokenAddress);
    expect(schedules[0].spender).toBe(spender1);
    expect(schedules[0].recipient).toBe(recipient);
    expect(schedules[0].amount).toBe(amount);
    expect(schedules[0].interval).toBe(interval);
    expect(schedules[0].occurrences).toBe(occurrences);
    expect(schedules[0].remaining).toBe(occurrences);
    expect(schedules[0].tolerance).toBe(tolerance);
    expect(schedules[0].history).toStrictEqual([]);

    const schedulesRecipientSer = getScheduleByRecipient(
      new Args().add(recipient).serialize(),
    );
    expect(
      new Args(schedulesRecipientSer)
        .nextSerializableObjectArray<Schedule>()
        .unwrap(),
    ).toStrictEqual(schedules);

    const scheduleSer = getSchedule(
      new Args().add(spender1).add(id).serialize(),
    );
    expect(new Args(scheduleSer).next<Schedule>().unwrap()).toStrictEqual(
      schedules[0],
    );
  });

  test('startScheduleSendFT multiple', () => {
    createSchedule();
    createSchedule(); // second schedule
    id++;

    const schedulesSer = getSchedulesBySpender(
      new Args().add(spender1).serialize(),
    );

    const schedules = new Args(schedulesSer)
      .nextSerializableObjectArray<Schedule>()
      .unwrap();
    expect(schedules.length).toBe(2);
    const schedulesRecipientSer = getScheduleByRecipient(
      new Args().add(recipient).serialize(),
    );
    expect(
      new Args(schedulesRecipientSer)
        .nextSerializableObjectArray<Schedule>()
        .unwrap(),
    ).toStrictEqual(schedules);

    const scheduleSer = getSchedule(
      new Args().add(spender1).add(id).serialize(),
    );
    expect(new Args(scheduleSer).next<Schedule>().unwrap()).toStrictEqual(
      schedules[1],
    );
  });

  test('startScheduleSendFT multiple spenders', () => {
    createSchedule();
    switchUser(spender2);
    createSchedule(spender2); // second schedule
    id++;

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
      new Args().add(spender2).add(id).serialize(),
    );
    expect(new Args(scheduleSer).next<Schedule>().unwrap()).toStrictEqual(
      schedules[0],
    );
  });
});

describe('async send FT', () => {
  test('success', () => {
    createSchedule();
    const schedule = new Args(
      getSchedulesBySpender(new Args().add(spender1).serialize()),
    )
      .nextSerializableObjectArray<Schedule>()
      .unwrap()[0];
    switchUser(contractAddress);
    mockScCall([]);
    asyncSendFT(new Args().add(schedule).serialize());
    const schedules = new Args(
      getSchedulesBySpender(new Args().add(spender1).serialize()),
    )
      .nextSerializableObjectArray<Schedule>()
      .unwrap();
    assert(schedules.length == 1);
    assert(schedules[0].remaining == occurrences - 1);

    // seconde autonomous execution
    mockScCall([]);
    asyncSendFT(new Args().add(schedule).serialize());
    const schedules2 = new Args(
      getSchedulesBySpender(new Args().add(spender1).serialize()),
    )
      .nextSerializableObjectArray<Schedule>()
      .unwrap();
    assert(schedules2.length == 1);
    assert(schedules2[0].remaining == occurrences - 1);
  });
});

describe('cancelScheduleSendFT', () => {
  test('success', () => {
    createSchedule();

    cancelScheduleSendFT(new Args().add(spender1).add(id).serialize());

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
      getSchedule(new Args().add(spender1).add(id).serialize());
    }).toThrow();
  });

  throws('fail: unauthorized', () => {
    createSchedule();
    switchUser(spender2);
    cancelScheduleSendFT(new Args().add(spender1).add(id).serialize());
  });

  test('multiple, cancel the first one', () => {
    createSchedule();
    createSchedule(); // second schedule
    id++;
    cancelScheduleSendFT(
      new Args()
        .add(spender1)
        .add(id - 1)
        .serialize(),
    );

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
      new Args().add(spender1).add(id).serialize(),
    );
    expect(new Args(scheduleSer).next<Schedule>().unwrap()).toStrictEqual(
      schedules[0],
    );
  });
});
