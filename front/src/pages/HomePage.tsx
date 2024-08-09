import { useRef } from 'react';
import { NumericInput, RecipientAddressInput, Recurrence } from '@/components';
import { Button, formatAmount, useAccountStore } from '@massalabs/react-ui-kit';
import { ConnectButton } from '@/components/ConnectWalletPopup/ConnectButton';
import { Card } from '@massalabs/react-ui-kit/src/components/Card/Card';
import useCreateSchedule from '@/services/useCreateSchedule';
import useGetSchedule from '@/services/useGetSchedule';
import useToken from '@/services/useToken';
import ScheduleTable from '@/components/scheduleTable';
import SelectAsset from '@/components/SelectAsset';
import { InputLabel } from '@/components/InputLabel';
import { schedulerAddress } from '@/const/contracts';

// TODO: Add error if a required field is missing
// TODO: Verify there is enough balance
// TODO: Allow user to restart schedule if stopped: Show user stopped if period is not reached. Allow user to restart
// TODO: Fix error in contract call
// TODO: Disable button if amount is zero or no allowance

export default function HomePage() {
  const { connectedAccount } = useAccountStore();
  const { scheduleInfo, setScheduleInfo, createSchedule } = useCreateSchedule();
  const { spenderSchedules, getSchedulesBySpender } = useGetSchedule();
  const { increaseAllowance, getAllowanceOf } = useToken(
    scheduleInfo.asset.address!,
  );

  const connected = !!connectedAccount;

  const listRef = useRef<HTMLDivElement>(null);

  const scrollToList = () => {
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
              <section className="max-w-2xl w-full mx-auto border rounded-2xl mb-6 bg-white shadow-lg p-6">
                <Card customClass="space-y-5 bg-transparent">
                  <div>
                    <div className="grid grid-cols-6 gap-2">
                      <div className="col-span-2">
                        <InputLabel
                          label={`${
                            formatAmount(
                              scheduleInfo.amount,
                              scheduleInfo.asset.decimals,
                            ).preview
                          } ${scheduleInfo.asset.name}`}
                        />
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
                      <div className="col-span-3">
                        <Recurrence
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
                      <SelectAsset
                        onSelectAsset={(asset) => {
                          if (asset.address) setScheduleInfo('asset', asset);
                        }}
                      />
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => getAllowanceOf(schedulerAddress)}
                  >
                    Get allowance of
                  </Button>
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
                        scheduleInfo.asset.decimals,
                      ).preview
                    } ${scheduleInfo.asset.name}`}
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
