import { useEffect, useRef } from 'react';
import { NumericInput, RecipientAddressInput, Recurrence } from '@/components';
import {
  Button,
  formatAmount,
  toast,
  useAccountStore,
} from '@massalabs/react-ui-kit';
import { ConnectButton } from '@/components/ConnectWalletPopup/ConnectButton';
import { Card } from '@massalabs/react-ui-kit/src/components/Card/Card';
import useCreateSchedule from '@/services/useCreateSchedule';
import useGetSchedule from '@/services/useGetSchedule';
import useToken from '@/services/useToken';
import ScheduleTable from '@/components/scheduleTable';
import SelectAsset from '@/components/SelectAsset';
import { InputLabel } from '@/components/InputLabel';
import { schedulerAddress } from '@/const/contracts';
import LogoSyntra from '../assets/logo-syntra.svg';
// TODO export SLOT from massalabs/massa-web3
import { Slot } from '@massalabs/massa-web3/dist/esm/generated/client';

// TODO: Add error if a required field is missing
// TODO: Verify there is enough balance
// TODO: Allow user to restart schedule if stopped: Show user stopped if period is not reached. Allow user to restart
// TODO: Fix error in contract call
// TODO: Disable button if amount is zero or no allowance
// TODO: Get Balance of user

export default function HomePage() {
  const { connectedAccount } = useAccountStore();
  const { scheduleInfo, setScheduleInfo, createSchedule } = useCreateSchedule();
  const { spenderSchedules, getSchedulesBySpender } = useGetSchedule();
  const { increaseAllowance } = useToken(scheduleInfo.asset.address!);

  const connected = !!connectedAccount;

  const listRef = useRef<HTMLDivElement>(null);
  const lastEventPeriodRef = useRef<Slot>();
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  const scrollToList = () => {
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (connectedAccount) {
      intervalId.current = setInterval(async () => {
        console.log('fetching events');
        const events = await connectedAccount.getEvents({
          smartContractAddress: schedulerAddress,
          start: lastEventPeriodRef.current,
        });

        for (const event of events) {
          console.log('event', event);
          const regex = /Transfer:([^]+)/;
          const match = event.data.match(regex);
          if (match) {
            toast.success(event.data);
            getSchedulesBySpender(connectedAccount.address);
          }
        }

        if (events.length <= 0) {
          return;
        }

        const { period, thread } = events[events.length - 1].context.slot;

        lastEventPeriodRef.current = { period: period + 1, thread };
      }, 4000);
    }

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, [connectedAccount]);

  return (
    <>
      <div className="main h-screen">
        <nav className="flex justify-between items-center px-10 py-5 w-full">
          <img src={LogoSyntra} alt="Syntra" className="w-40 h-20" />
          <ConnectButton />
        </nav>

        {connected && (
          <div className="  flex flex-col justify-center items-center gap-10 h-full">
            <section className="max-w-2xl w-full mx-auto rounded-2xl shadow-lg p-7 bg-white -mt-40">
              <Card customClass="bg-transparent grid grid-flow-row gap-4 ">
                <div className="grid grid-cols-6 gap-2">
                  <div className=" col-span-4">
                    <InputLabel label={'Amount'} />
                    <NumericInput
                      placeholder="Enter your amount"
                      onNumChange={(amount) => {
                        setScheduleInfo(
                          'amount',
                          BigInt(amount) *
                            BigInt(10 ** scheduleInfo.asset.decimals),
                        );
                      }}
                      value={
                        formatAmount(
                          scheduleInfo.amount,
                          scheduleInfo.asset.decimals,
                        ).preview
                      }
                    />
                  </div>

                  <div className="col-span-2">
                    <InputLabel label="Token" />
                    <SelectAsset
                      onSelectAsset={(asset) => {
                        if (asset.address) setScheduleInfo('asset', asset);
                      }}
                    />
                  </div>
                </div>

                <div className="">
                  <InputLabel label="Recipient Address" />
                  <RecipientAddressInput
                    value={scheduleInfo.recipient}
                    onAddressChange={(address) => {
                      setScheduleInfo('recipient', address);
                    }}
                  />
                </div>

                <div className="grid grid-cols-6 gap-2">
                  <div className="col-span-3">
                    <Recurrence
                      onRecurrenceChange={(value: bigint) => {
                        setScheduleInfo('interval', BigInt(value));
                      }}
                    />
                  </div>

                  <div className=" col-start-6 col-span-1">
                    <InputLabel label="Repeat" />
                    <NumericInput
                      placeholder="Enter amount"
                      value={scheduleInfo.occurrences.toString()}
                      onNumChange={(value) => {
                        setScheduleInfo('occurrences', BigInt(value));
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-rows-2 gap-2 mt-5">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      increaseAllowance(
                        scheduleInfo.amount * scheduleInfo.occurrences,
                      )
                    }
                    // eslint-disable-next-line max-len
                    customClass="border-primary text-primary bg-white w-full py-2 rounded-md ring-0 hover:-translate-y-[2%] hover:shadow-md active:translate-y-[1%] active:shadow-none transition-all duration-50 ease-in-out"
                  >
                    {`Allow ${
                      formatAmount(
                        scheduleInfo.amount * scheduleInfo.occurrences,
                        scheduleInfo.asset.decimals,
                      ).preview
                    } ${scheduleInfo.asset.name}`}
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={createSchedule}
                    // eslint-disable-next-line max-len
                    className="bg-primary text-white border-4 w-full py-2 rounded-md ring-0 outline-none hover:bg-opacity-80 hover:-translate-y-[2%] hover:shadow-md active:translate-y-[1%] active:shadow-none transition-all duration-50 ease-in-out"
                  >
                    Create Schedule
                  </Button>
                </div>
              </Card>
            </section>
            <button
              // eslint-disable-next-line max-len
              className="p-2 rounded-full bg-white hover:bg-gray-200 text-primary hover:ring-1 ring-primary transition-all duration-100 ease-in-out active:translate-y-1"
              onClick={() => {
                scrollToList();
                if (connectedAccount) {
                  getSchedulesBySpender(connectedAccount.address);
                }
              }}
            >
              ↓
            </button>
          </div>
        )}
      </div>

      <div ref={listRef} className="h-screen bg-white">
        {spenderSchedules.length > 0 ? (
          <ScheduleTable schedules={spenderSchedules} />
        ) : (
          <div className="text-center text-gray-500">No schedules found</div>
        )}
      </div>
    </>
  );
}
