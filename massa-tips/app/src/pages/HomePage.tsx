import { Card } from '../components/Card';
import {
  NumericInput,
  RecipientAddressInput,
  RecurrenceDropdown,
} from '@/components';
import {
  ConnectMassaWallet,
  useAccountStore,
} from '@massalabs/react-ui-kit/src/lib/ConnectMassaWallets';
import { useWriteSmartContract } from '@massalabs/react-ui-kit/src/lib/massa-react/hooks/useWriteSmartContract';
import { useState } from 'react';
import { Schedule } from '@/serializable/Schedule';
import { Button } from '@massalabs/react-ui-kit';

const fakeContractAddress =
  'AS1JBKmq7yQG8iTsnw54pSVy1f7YicGuVuXrRdoqz3iLmyNPdEmw';

export default function HomePage() {
  const { connectedAccount, currentProvider } = useAccountStore();
  const { callSmartContract } = useWriteSmartContract(
    connectedAccount!,
    currentProvider!,
  );
  const connected = !!connectedAccount && !!currentProvider;

  const [amount, setAmount] = useState<string>('');
  const [recurrence, setRecurrence] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('');

  function sendNewSchedule() {
    if (!amount || !recurrence || !recipientAddress || !connectedAccount) {
      console.error('Missing required fields');
      return;
    } else if (isNaN(Number(amount))) {
      console.error('Invalid amount');
      return;
    }

    const schedule = new Schedule(
      BigInt(amount),
      recurrence,
      recipientAddress,
      connectedAccount.address(),
    );

    callSmartContract(
      'startScheduleSendFT',
      fakeContractAddress,
      schedule.serialize(),
      {
        pending: 'string',
        success: 'string',
        error: 'string',
        timeout: 'string',
      },
      0n,
    );
  }

  return (
    <div className="sm:w-full md:max-w-4xl mx-auto">
      <div className="flex justify-between mb-2">
        <img
          src="/logo_massa.svg"
          alt="Massa logo"
          style={{ height: '64px' }}
        />
      </div>
      <div className="p-5">
        <section className="mb-4 p-2">
          <p className="mas-title mb-2">Massa Tips</p>
          <h4 className="mas-body">
            This tool allows receiving vested MAS tokens securely.
            <br />
            This app requires a compatible Massa wallet. We recommend{' '}
            <a className="mas-menu-underline" href="https://station.massa.net">
              Massa Station
            </a>
            .<br />
            The section below enables you to connect your wallet and, displays
            the active vesting sessions targeting your wallet address.
          </h4>
        </section>
        <section className="mb-10">
          <Card>
            <ConnectMassaWallet />
          </Card>
        </section>
        <section className="mb-10">
          <Card>
            <h3 className="mas-h3">
              Connect a wallet to view your vesting sessions
            </h3>
          </Card>
        </section>

        {connected && (
          <section className="mb-10">
            <Card customClass="flex gap-2">
              <NumericInput
                value="0"
                placeholder="Enter your amount"
                onNumChange={(amount) => {
                  setAmount(amount);
                }}
              />
              <RecurrenceDropdown
                value={{
                  item: 'Daily',
                  itemPreview: 'Every day',
                }}
                onRecurrenceChange={function (value: string): void {
                  setRecurrence(value);
                }}
              />

              <RecipientAddressInput
                value={recipientAddress}
                onAddressChange={(address) => {
                  setRecipientAddress(address);
                }}
              />

              <Button variant="secondary" onClick={sendNewSchedule}>
                Create Schedule
              </Button>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
