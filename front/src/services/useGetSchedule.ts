import { fakeSchedulerAddress } from '@/const/contracts';
import { Schedule } from '@/serializable/Schedule';
import { Args, Mas } from '@massalabs/massa-web3';
import { useAccountStore } from '@massalabs/react-ui-kit';

export default function useGetSchedule() {
  const { connectedAccount } = useAccountStore();

  async function getSchedulesBySpender(spender: string) {
    if (!spender) {
      console.error('Missing required fields');
      return;
    }

    getSchedule('getSchedulesBySpender', new Args().addString(spender));
  }

  async function getScheduleByRecipient(recipient: string) {
    if (!recipient) {
      console.error('Missing required fields');
      return;
    }

    console.log('Recipient:', recipient);

    getSchedule('getSchedulesByRecipient', new Args().addString(recipient));
  }

  async function getSchedule(functionName: string, args: Args) {
    if (!connectedAccount) {
      console.error('You must be connected to an account');
      return;
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
      return;
    }

    const schedules = new Args(res.returnValue).nextSerializableObjectArray(
      Schedule,
    );

    for (const s of schedules) {
      console.log('Schedule:', s);
    }
  }

  return {
    getSchedulesBySpender,
    getScheduleByRecipient,
  };
}
