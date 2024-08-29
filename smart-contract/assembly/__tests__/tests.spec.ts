import {
  cancelSchedules,
  asyncSend,
  constructor,
  getSchedule,
  getScheduleByRecipient,
  getSchedulesBySpender,
  startScheduleSend,
} from '../contracts/main';
import { Args, u256ToBytes } from '@massalabs/as-types';
import {
  Address,
  changeCallStack,
  mockAdminContext,
  mockBalance,
  mockScCall,
  mockTransferredCoins,
  resetStorage,
  Storage,
} from '@massalabs/massa-as-sdk';
import { u256 } from 'as-bignum/assembly';
import { Schedule } from '../Schedule';
import { balanceKey } from '@massalabs/sc-standards/assembly/contracts/FT/token-internals';
import { getIdCounter } from '../internal';
import { UPDATE_COST } from '../refund';
import { getBalanceEntryCost } from '@massalabs/sc-standards/assembly/contracts/FT/token-external';

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
});

function createSchedule(spender: string = spender1): void {
  // mock allowance
  // @ts-ignore
  mockScCall(u256ToBytes(amount * u256.fromU64(occurrences)));

  const schedule = new Schedule(
    0,
    'lolmao',
    false,
    tokenAddress,
    spender,
    recipient,
    amount,
    interval,
    occurrences,
    occurrences,
    tolerance,
  );

  const updateCost = UPDATE_COST * occurrences;
  const sendCost = getBalanceEntryCost(tokenAddress, recipient);
  const total = updateCost + sendCost;
  mockBalance(spender, total);
  mockTransferredCoins(total);

  const params = new Args().add(schedule);
  startScheduleSend(params.serialize());
}

function createMasSchedule(spender: string = spender1): void {
  const schedule = new Schedule(
    0,
    'lolmao',
    true,
    '',
    spender,
    recipient,
    amount,
    interval,
    occurrences,
    occurrences,
    tolerance,
  );

  const params = new Args().add(schedule);

  const updateCost = UPDATE_COST * occurrences;
  const sendCost = schedule.amount.toU64() * schedule.occurrences;
  const total = updateCost + sendCost;

  mockBalance(spender, total);
  mockTransferredCoins(total);

  startScheduleSend(params.serialize());
}

describe('Scheduler app test', () => {
  test('startScheduleSend FT', () => {
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
      new Args().add(spender1).add(schedules[0].id).serialize(),
    );
    expect(new Args(scheduleSer).next<Schedule>().unwrap()).toStrictEqual(
      schedules[0],
    );
  });

  test('startScheduleSend MAS', () => {
    const currentId = getIdCounter();
    createMasSchedule();

    const schedulesSer = getSchedulesBySpender(
      new Args().add(spender1).serialize(),
    );

    const schedules = new Args(schedulesSer)
      .nextSerializableObjectArray<Schedule>()
      .unwrap();

    expect(schedules.length).toBe(1);
    expect(schedules[0].id).toBe(currentId + 1);
    expect(schedules[0].tokenAddress).toBe('');
    expect(schedules[0].isVesting).toBe(true);
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
      new Args().add(spender1).add(schedules[0].id).serialize(),
    );
    expect(new Args(scheduleSer).next<Schedule>().unwrap()).toStrictEqual(
      schedules[0],
    );
  });

  test('startScheduleSend multiple', () => {
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

  test('startScheduleSend multiple spenders', () => {
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
});

describe('async send FT', () => {
  test('success', () => {
    createSchedule();
    const schedule = new Args(
      getSchedulesBySpender(new Args().add(spender1).serialize()),
    )
      .nextSerializableObjectArray<Schedule>()
      .unwrap()[0];

    // prepare async call context
    switchUser(contractAddress);
    mockScCall([]);

    // 1st autonomous execution
    asyncSend(new Args().add(schedule.spender).add(schedule.id).serialize());
    let schedules = new Args(
      getSchedulesBySpender(new Args().add(spender1).serialize()),
    )
      .nextSerializableObjectArray<Schedule>()
      .unwrap();
    expect(schedules).toHaveLength(1);
    expect(schedules[0].remaining).toBe(occurrences - 1);

    // Set the balance entry on token contract
    // with this set, the cost of creating token balance entry will be 0
    Storage.setOf(
      new Address(tokenAddress),
      balanceKey(new Address(recipient)),
      u256ToBytes(schedule.amount),
    );

    mockScCall([]);

    // 2n autonomous execution
    asyncSend(new Args().add(schedule.spender).add(schedule.id).serialize());
    schedules = new Args(
      getSchedulesBySpender(new Args().add(spender1).serialize()),
    )
      .nextSerializableObjectArray<Schedule>()
      .unwrap();
    expect(schedules).toHaveLength(1);
    expect(schedules[0].remaining).toBe(occurrences - 2);
  });
});

describe('async send MAS', () => {
  test('success', () => {
    createMasSchedule();
    const schedule = new Args(
      getSchedulesBySpender(new Args().add(spender1).serialize()),
    )
      .nextSerializableObjectArray<Schedule>()
      .unwrap()[0];

    switchUser(contractAddress);

    // 1st autonomous execution
    asyncSend(new Args().add(schedule.spender).add(schedule.id).serialize());
    let schedules = new Args(
      getSchedulesBySpender(new Args().add(spender1).serialize()),
    )
      .nextSerializableObjectArray<Schedule>()
      .unwrap();
    expect(schedules).toHaveLength(1);
    expect(schedules[0].remaining).toBe(occurrences - 1);

    // 2n autonomous execution
    asyncSend(new Args().add(schedule.spender).add(schedule.id).serialize());
    schedules = new Args(
      getSchedulesBySpender(new Args().add(spender1).serialize()),
    )
      .nextSerializableObjectArray<Schedule>()
      .unwrap();
    expect(schedules).toHaveLength(1);
    expect(schedules[0].remaining).toBe(occurrences - 2);
  });
});

describe('cancelSchedules', () => {
  test('cancel 2 schedules', () => {
    const schedueleId = getIdCounter() + 1;
    createSchedule();
    createSchedule();

    cancelSchedules(
      new Args()
        .add(spender1)
        .add([schedueleId, schedueleId + 1])
        .serialize(),
    );

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

  throws('fail: cancel Mas scheduele', () => {
    createMasSchedule();
    cancelSchedules(new Args().add(spender1).add([getIdCounter()]).serialize());
  });

  throws('fail: unauthorized', () => {
    const schedueleId = getIdCounter() + 1;
    createSchedule();
    switchUser(spender2);
    cancelSchedules(new Args().add(spender1).add([schedueleId]).serialize());
  });

  throws('fail: scheduele not fount', () => {
    createSchedule();
    switchUser(spender2);
    cancelSchedules(new Args().add(spender1).add([6666666]).serialize());
  });

  test('multiple create, cancel the first one', () => {
    const schedueleId = getIdCounter() + 1;
    createSchedule();
    createSchedule(); // second schedule

    cancelSchedules(new Args().add(spender1).add([schedueleId]).serialize());

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
