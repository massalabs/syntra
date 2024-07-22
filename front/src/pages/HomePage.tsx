import {
  NumericInput,
  RecipientAddressInput,
  RecurrenceDropdown,
} from '@/components';
import { fakeTokenAddress } from '@/const/contracts';
import { Button, useAccountStore } from '@massalabs/react-ui-kit';
import { ConnectButton } from '@/components/ConnectWalletPopup/ConnectButton';
import { Card } from '@massalabs/react-ui-kit/src/components/Card/Card';
import { Mas } from '@massalabs/massa-web3';
import useCreateSchedule from '@/services/useCreateSchedule';
import useGetSchedule from '@/services/useGetSchedule';
import useToken from '@/services/useToken';

export default function HomePage() {
  const { connectedAccount, currentProvider } = useAccountStore();
  const { scheduleInfo, setScheduleInfo, createSchedule } = useCreateSchedule();
  const { increaseAllowance, getBalanceOf } = useToken(fakeTokenAddress);
  const { getSchedulesBySpender, getScheduleByRecipient } = useGetSchedule();

  const connected = !!connectedAccount && !!currentProvider;

  return (
    <div className="mt-32">
      <ConnectButton />
      <div className="flex-col p-5 w-full">
        <p className="w-full mas-title mb-2 text-center">Massa Tips</p>

        {connected && (
          <section className="mt-10 space-y-5 max-w-2xl m-auto">
            <Card customClass="mb-10 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <InputLabel label="Amount" />
                  <NumericInput
                    placeholder="Enter your amount"
                    onNumChange={(amount) => {
                      setScheduleInfo('amount', amount);
                    }}
                    value={scheduleInfo.amount.toString()}
                  />
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
                  <InputLabel label="Interval" />
                  <RecurrenceDropdown
                    value={Number(scheduleInfo.interval)} // Assuming your dropdown uses IOption interface
                    onRecurrenceChange={(value: number) => {
                      setScheduleInfo('interval', BigInt(value));
                    }}
                  />
                </div>
                <div>
                  <InputLabel label="Repeat" />
                  <NumericInput
                    placeholder="Enter your amount"
                    value={scheduleInfo.occurrences.toString()}
                    onNumChange={(value) => {
                      setScheduleInfo('occurrences', value);
                    }}
                  />
                </div>
              </div>

              <div className="flex mt-4 gap-4">
                <Button
                  variant="secondary"
                  onClick={() => increaseAllowance(scheduleInfo.amount)}
                >
                  Allow {Mas.toString(scheduleInfo.amount)} Mas
                </Button>
                <Button variant="secondary" onClick={createSchedule}>
                  Create Schedule
                </Button>
              </div>
            </Card>
          </section>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
        <div className="p-4 border rounded-lg shadow-md">
          <label className="block mb-2 font-semibold">Token Balance</label>
          <button
            className="btn btn-primary mb-2"
            onClick={() => getBalanceOf(connectedAccount?.address() || '')}
          >
            Get Balance connected account
          </button>
          <button
            className="btn btn-primary"
            onClick={() => getBalanceOf(scheduleInfo.recipient)}
          >
            Get Balance recipient
          </button>
        </div>

        <div className="p-4 border rounded-lg shadow-md">
          <label className="block mb-2 font-semibold">Schedule Info</label>
          <button
            className="btn btn-primary mb-2"
            onClick={() =>
              getSchedulesBySpender(connectedAccount?.address() || '')
            }
          >
            Get Schedules by spender
          </button>
          <button
            className="btn btn-primary"
            onClick={() => getScheduleByRecipient(scheduleInfo.recipient)}
          >
            Get Schedules by recipient
          </button>
        </div>
      </div>
    </div>
  );
}

function InputLabel(props: { label: string }) {
  return <p className="text-sm text-gray-500 mb-2">{props.label}</p>;
}
