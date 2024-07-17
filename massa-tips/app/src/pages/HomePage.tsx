import { useState } from 'react';
import { Card } from '../components/Card';
import { Schedule } from '@/serializable/Schedule';
import {
  NumericInput,
  RecipientAddressInput,
  RecurrenceDropdown,
} from '@/components';
import {
  Button,
  useWriteSmartContract,
  useAccountStore,
} from '@massalabs/react-ui-kit';
import { ConnectButton } from '@/components/ConnectWalletPopup/ConnectButton';
import { Address } from '@massalabs/massa-web3';

const fakeContractAddress =
  'AS12ip9eFwpdq57EDJhgCMpmDmArLg8CT4UVEFRggXZD8FSz9wKMa';

const fakeTokenAddress = 'AS1JBKmq7yQG8iTsnw54pSVy1f7YicGuVuXrRdoqz3iLmyNPdEmw';

export default function HomePage() {
  const { connectedAccount, currentProvider } = useAccountStore();

  const { callSmartContract } = useWriteSmartContract(
    connectedAccount!,
    currentProvider!,
  );
  const connected = !!connectedAccount && !!currentProvider;

  const [amount, setAmount] = useState<string>('');
  const [recurrence, setRecurrence] = useState<number>(0);
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [occurrences, setOccurrence] = useState<string>('');
  const [remainingOccurrences, setRemainingOccurrences] = useState<number>(0);
  const [tolerance, setTolerance] = useState<number>(0);
  const [error, setError] = useState<string>('');

  function sendNewSchedule() {
    if (!amount || !recurrence || !recipientAddress || !connectedAccount) {
      console.error('Missing required fields');
      return;
    } else if (isNaN(Number(amount))) {
      console.error('Invalid amount');
      return;
    }

    try {
      Address.fromString(recipientAddress);
    } catch (error) {
      setError('Invalid recipient address');
    }

    const schedule = new Schedule(
      BigInt(0),
      fakeTokenAddress,
      connectedAccount.address(),
      recipientAddress,
      BigInt(amount),
      BigInt(recurrence),
      BigInt(occurrences),
      BigInt(remainingOccurrences),
      BigInt(tolerance),
    );

    // callSmartContract(
    //   'startScheduleSendFT',
    //   fakeContractAddress,
    //   schedule.serialize(),
    //   {
    //     pending: 'string',
    //     success: 'string',
    //     error: 'string',
    //     timeout: 'string',
    //   },
    //   0n,
    // );
  }

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
                      setAmount(amount);
                    }}
                    value={amount}
                  />
                </div>
                <div>
                  <InputLabel label="Recipient Address" />
                  <RecipientAddressInput
                    value={recipientAddress}
                    onAddressChange={(address) => {
                      setRecipientAddress(address);
                    }}
                  />
                </div>
                <div>
                  <InputLabel label="Recurrence" />
                  <RecurrenceDropdown
                    value={recurrence} // Assuming your dropdown uses IOption interface
                    onRecurrenceChange={(value: number) => {
                      setRecurrence(value);
                    }}
                  />
                </div>
                <div>
                  <InputLabel label="Repeat" />
                  <NumericInput
                    placeholder="Enter your amount"
                    onNumChange={(value) => {
                      setOccurrence(value);
                    }}
                    value={occurrences}
                  />
                </div>
              </div>

              <span className="text-sm text-red-500">{error}</span>

              <div className="mt-4">
                <Button variant="secondary" onClick={sendNewSchedule}>
                  Create Schedule
                </Button>
              </div>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}

function InputLabel(props: { label: string }) {
  return <p className="text-sm text-gray-500 mb-2">{props.label}</p>;
}
