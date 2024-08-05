import {
  NumericInput,
  RecipientAddressInput,
  RecurrenceDropdown,
} from '@/components';
import { fakeTokenAddress } from '@/const/contracts';
import {
  Button,
  Dropdown,
  formatAmount,
  useAccountStore,
} from '@massalabs/react-ui-kit';
import { ConnectButton } from '@/components/ConnectWalletPopup/ConnectButton';
import { Card } from '@massalabs/react-ui-kit/src/components/Card/Card';
import useCreateSchedule from '@/custom/hooks/useCreateSchedule';
import useGetSchedule from '@/custom/hooks/useGetSchedule';
import ScheduleTable from '@/components/scheduleTable';
import { useRef, useEffect } from 'react';
import useToken from '@/custom/hooks/useToken';

export default function HomePage() {
  const { connectedAccount, currentWallet } = useAccountStore();
  const { scheduleInfo, setScheduleInfo, createSchedule } = useCreateSchedule();
  const { spenderSchedules, getSchedulesBySpender } = useGetSchedule();
  const { increaseAllowance } = useToken(fakeTokenAddress);

  const connected = !!connectedAccount && !!currentWallet;

  const listRef = useRef<HTMLDivElement>(null);

  const scrollToList = () => {
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (connectedAccount) {
      const fetchSchedules = async () => {
        const address = await connectedAccount.address;
        getSchedulesBySpender(address);
      };
      fetchSchedules();
    }
  }, [connectedAccount, getSchedulesBySpender]);

  return (
    <>
      <div className="h-screen flex flex-col justify-between">
        <ConnectButton />

        <div className="flex flex-col p-5 w-full flex-1">
          <p className="w-full text-4xl font-bold text-white mb-2 text-center">
            Massa Tips
          </p>

          {connected && (
            <div className="flex flex-col justify-center items-center gap-4 flex-1">
              <section className="max-w-2xl w-full mx-auto border rounded-md mb-6 bg-white shadow-lg p-6">
                <Card customClass="space-y-5 bg-transparent">
                  <div>
                    <div className="grid grid-cols-6 gap-2">
                      <div className="col-span-3">
                        <InputLabel
                          label={`Amount ${
                            formatAmount(scheduleInfo.amount).preview
                          } Mas`}
                        />
                        <NumericInput
                          placeholder="Enter your amount"
                          onNumChange={(amount) => {
                            setScheduleInfo('amount', BigInt(amount));
                          }}
                          value={scheduleInfo.amount.toString()}
                        />
                      </div>
                      <div className="col-span-2">
                        <InputLabel label="Interval" />
                        <RecurrenceDropdown
                          value={scheduleInfo.interval}
                          onRecurrenceChange={(value: bigint) => {
                            setScheduleInfo('interval', BigInt(value));
                          }}
                        />
                      </div>
                      <div className="col-span-1">
                        <InputLabel label="Repeat" />
                        <NumericInput
                          placeholder="Enter your amount"
                          value={scheduleInfo.occurrences.toString()}
                          onNumChange={(value) => {
                            setScheduleInfo('occurrences', BigInt(value));
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <InputLabel label="Recipient Address" />
                      <RecipientAddressInput
                        value={scheduleInfo.recipient}
                        onAddressChange={(address) => {
                          setScheduleInfo('recipient', address);
                        }}
                      />
                    </div>
                    <div>
                      <InputLabel label="Token" />
                      <Dropdown options={[]} />
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      increaseAllowance(
                        scheduleInfo.amount * scheduleInfo.occurrences,
                      )
                    }
                  >
                    {`Allow ${
                      formatAmount(
                        scheduleInfo.amount * scheduleInfo.occurrences,
                      ).preview
                    } Mas`}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={createSchedule}
                    className="bg-primary text-white border-4 w-full py-2 rounded-md mt-4 ring-0 outline-none"
                  >
                    Create Schedule
                  </Button>
                </Card>
              </section>
              <button
                className="p-2 rounded-full bg-white hover:bg-gray-200 text-blue-500"
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
      </div>

      <div
        ref={listRef}
        className="h-screen flex flex-col items-center justify-center bg-gray-100"
      >
        {spenderSchedules.length > 0 ? (
          <ScheduleTable schedules={spenderSchedules} />
        ) : (
          <div className="text-center text-gray-500">No schedules found</div>
        )}
      </div>
    </>
  );
}

function InputLabel(props: { label: string }) {
  return <p className="text-sm text-gray-700 mb-2">{props.label}</p>;
}
