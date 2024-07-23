import { fakeSchedulerAddress } from '@/const/contracts';
import { Schedule } from '@/serializable/Schedule';
import { Args, Mas } from '@massalabs/massa-web3';
import { useAccountStore } from '@massalabs/react-ui-kit';
import { useState } from 'react';

export default function useGetSchedule() {
  const { connectedAccount } = useAccountStore();
  const [spenderSchedules, setSpenderSchedules] = useState<Schedule[]>([]);

  async function getSchedulesBySpender(spender: string) {
    if (!spender) {
      console.error('Missing required fields');
      return;
    }

    const result = await getSchedule(
      'getSchedulesBySpender',
      new Args().addString(spender),
    );
    setSpenderSchedules(result);
  }

  async function getScheduleByRecipient(recipient: string) {
    if (!recipient) {
      console.error('Missing required fields');
      return;
    }

    console.log('Recipient:', recipient);

    await getSchedule(
      'getScheduleByRecipient',
      new Args().addString(recipient),
    );
  }

  async function getSchedule(
    functionName: string,
    args: Args,
  ): Promise<Schedule[]> {
    if (!connectedAccount) {
      console.error('You must be connected to an account');
      return [];
    }

    const res = await connectedAccount.readSc(
      fakeSchedulerAddress,
      functionName,
      args.serialize(),
      Mas.fromString('0.01'),
      Mas.fromString('0.01'),
      BigInt(4000000000),
    );

    console.log('Operation:', res);

    // Weird sometime it returns an array [0,0,0,0] and sometimes it returns an empty Array
    if (res.returnValue.length === 0) {
      console.log('No schedules found');
      return [];
    }

    const schedules = new Args(res.returnValue).nextSerializableObjectArray(
      Schedule,
    );

    for (const s of schedules) {
      console.log('Schedule:', s);
    }

    return schedules;
  }

  return {
    spenderSchedules,
    getSchedulesBySpender,
    getScheduleByRecipient,
  };
}
