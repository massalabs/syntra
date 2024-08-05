import { schedulerAddress } from '@/const/contracts';
import { Schedule } from '@/serializable/Schedule';
import { Args } from '@massalabs/massa-web3';
import { useAccountStore } from '@massalabs/react-ui-kit';
import { useCallback, useEffect, useState } from 'react';

export default function useGetSchedule() {
  const { connectedAccount } = useAccountStore();
  const [spenderSchedules, setSpenderSchedules] = useState<Schedule[]>([]);

  const getSchedule = useCallback(
    async (functionName: string, args: Args): Promise<Schedule[]> => {
      if (!connectedAccount) {
        console.error('You must be connected to an account');
        return [];
      }

      const res = await connectedAccount.readSC({
        func: functionName,
        target: schedulerAddress,
        parameter: args.serialize(),
        caller: connectedAccount.address,
      });

      console.log('Operation:', res);

      // Weird sometime it returns an array [0,0,0,0] and sometimes it returns an empty Array
      if (res.value.length === 0) {
        console.log('No schedules found');
        return [];
      }

      const schedules = new Args(res.value).nextSerializableObjectArray(
        Schedule,
      );

      for (const s of schedules) {
        console.log('Schedule:', s);
      }

      return schedules;
    },
    [connectedAccount],
  );

  const getSchedulesBySpender = useCallback(
    async (spender: string) => {
      if (!spender) {
        console.error('Missing required fields');
        return;
      }

      const result = await getSchedule(
        'getSchedulesBySpender',
        new Args().addString(spender),
      );
      setSpenderSchedules(result);
    },
    [getSchedule, setSpenderSchedules],
  );
  useEffect(() => {
    const fetchSchedules = async () => {
      if (connectedAccount) {
        const address = connectedAccount.address;
        getSchedulesBySpender(address);
      }
    };

    fetchSchedules();
  }, [connectedAccount, getSchedulesBySpender]);

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

  return {
    spenderSchedules,
    getSchedulesBySpender,
    getScheduleByRecipient,
  };
}
