import { getSchedulesBySpender, startScheduleSendFT } from '../contracts/main';
import { Args, u256ToBytes } from '@massalabs/as-types';
import { mockScCall } from '@massalabs/massa-as-sdk';
import { u256 } from 'as-bignum/assembly';
import { Schedule } from '../Schedule';

describe('Scheduler app test', () => {
  test('startScheduleSendFT', () => {
    const tokenAddress =
      'AS12LpYyAjYRJfYhyu7fkrS224gMdvFHVEeVWoeHZzMdhis7UZ3Eb';
    const spender = 'AU12NT6c6oiYQhcXNAPRRqDudZGurJkFKcYNLPYSwYkMoEniHv8FW';
    const recipient = 'AU12W92UyGW4Bd94BPniTq4Ra5yhiv6RvjazV2G9Q9GyekYkgqbme';
    const amount = u256.fromU64(12345678910);
    const interval: u64 = 60;
    const occurrences: u64 = 10;
    const tolerance: u32 = 5;

    // mock allowance
    mockScCall(u256ToBytes(amount));

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

    const schedulesSer = getSchedulesBySpender(
      new Args().add(spender).serialize(),
    );

    const schedules = new Args(schedulesSer)
      .nextSerializableObjectArray<Schedule>()
      .unwrap();
    expect(schedules.length).toBe(1);
    expect(schedules[0].tokenAddress).toBe(tokenAddress);
    expect(schedules[0].spender).toBe(spender);
    expect(schedules[0].recipient).toBe(recipient);
    expect(schedules[0].amount).toBe(amount);
    expect(schedules[0].interval).toBe(interval);
    expect(schedules[0].occurrences).toBe(occurrences);
    expect(schedules[0].remaining).toBe(occurrences);
    expect(schedules[0].tolerance).toBe(tolerance);
  });
});
