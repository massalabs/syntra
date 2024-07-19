import { useState } from 'react';
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
import { Card } from '@massalabs/react-ui-kit/src/components/Card/Card';
import { ConnectButton } from '@/components/ConnectWalletPopup/ConnectButton';
import {
  Address,
  Args,
  JsonRPCClient,
  Mas,
  Operation,
  OperationStatus,
  U256,
} from '@massalabs/massa-web3';
import { ITransactionDetails } from '@massalabs/wallet-provider';

const fakeContractAddress =
  'AS12wH9Cx4u5dRB9WmoQxqRhv3riVfeu4CsSsBeQwjdApYridXBfG';

const fakeTokenAddress = 'AS1L79EoEFNpbxCsBi7VpCX5WXZewpUopXykKhPH33NuBksdSqDW';

export default function HomePage() {
  const { connectedAccount, currentProvider } = useAccountStore();

  const { callSmartContract } = useWriteSmartContract(
    connectedAccount!,
    currentProvider!,
  );
  const connected = !!connectedAccount && !!currentProvider;

  const [amount, setAmount] = useState<string>(
    Mas.fromString('0.01').toString(),
  );
  const [interval, setInterval] = useState<number>(50);
  const [recipientAddress, setRecipientAddress] = useState<string>(
    'AU1dvPZNjcTQfNQQuysWyxLLhEzw4kB9cGW2RMMVAQGrkzZHqWGD',
  );
  const [occurrences, setOccurrence] = useState<string>('5');
  const [remainingOccurrences, setRemainingOccurrences] = useState<number>(2);
  const [tolerance, setTolerance] = useState<number>(1); // Period number
  const [error, setError] = useState<string>('');

  async function sendNewSchedule() {
    if (!amount || !interval || !recipientAddress || !connectedAccount) {
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
      BigInt(interval),
      BigInt(occurrences),
      BigInt(remainingOccurrences),
      BigInt(tolerance),
    );

    console.log('Calling smart contract...');

    const op = (await connectedAccount.callSC(
      fakeContractAddress,
      'startScheduleSendFT',
      schedule.serialize(),
      Mas.fromString('0.01'),
      Mas.fromString('0.01'),
      BigInt(4000000000),
    )) as ITransactionDetails;

    console.log('Operation:', op);

    if (!op) {
      console.error('Failed to start schedule');
      return;
    }

    const operation = new Operation(JsonRPCClient.buildnet(), op.operationId);

    const status = await operation.waitSpeculativeExecution();

    console.log('Status:', OperationStatus[status]);
    if (status === OperationStatus.Error) {
      console.error('Failed to startschedule');
      return;
    }

    const event = await operation.getSpeculativeEvents();

    for (const e of event) {
      console.log('Event:', e.data);
    }
  }

  async function increaseAllowance() {
    if (!amount || !connectedAccount) {
      console.error('Missing required fields');
      return;
    } else if (isNaN(Number(amount))) {
      console.error('Invalid amount');
      return;
    }

    console.log('Calling smart contract...');

    const op = (await connectedAccount.callSC(
      fakeTokenAddress,
      'increaseAllowance',
      new Args()
        .addString(fakeContractAddress)
        .addU256(BigInt(amount))
        .serialize(),
      BigInt(amount),
      Mas.fromString('0.01'),
      BigInt(4000000000),
    )) as ITransactionDetails;

    console.log('Operation:', op);

    if (!op) {
      console.error('Failed to approve amount');
      return;
    }

    const operation = new Operation(JsonRPCClient.buildnet(), op.operationId);

    const status = await operation.waitSpeculativeExecution();

    console.log('Status:', status);
    if (status === OperationStatus.Error) {
      console.error('Failed to approve amount');
      return;
    }

    const event = await operation.getSpeculativeEvents();

    for (const e of event) {
      console.log('Event:', e.data);
    }
  }

  async function getBalanceof(address: string) {
    if (!address || !connectedAccount) {
      console.error('Missing required fields');
      return;
    }

    console.log('Calling smart contract...');

    const op = await connectedAccount.readSc(
      fakeTokenAddress,
      'balanceOf',
      new Args().addString(address).serialize(),
      Mas.fromString('0.01'),
      Mas.fromString('0.01'),
      BigInt(4000000000),
    );

    console.log('Operation:', U256.fromBytes(op.returnValue));
  }

  async function getSchedulesBySpender(spender: string) {
    if (!spender || !connectedAccount) {
      console.error('Missing required fields');
      return;
    }

    console.log('Calling smart contract...');

    const op = await connectedAccount.readSc(
      fakeContractAddress,
      'getSchedulesBySpender',
      new Args().addString(spender).serialize(),
      Mas.fromString('0.01'),
      Mas.fromString('0.01'),
      BigInt(4000000000),
    );

    console.log(op.returnValue);

    const arg = new Args(op.returnValue).nextSerializableObjectArray(Schedule);

    for (const s of arg) {
      console.log('Schedule:', s);
    }
  }

  async function getScheduleByRecipient(recipient: string) {
    if (!recipient || !connectedAccount) {
      console.error('Missing required fields');
      return;
    }

    console.log('Calling smart contract...');

    // TODO: Fix this in wallet provider. Or at least the readSc
    const op = await connectedAccount.readSc(
      fakeContractAddress,
      'getSchedulesByRecipient',
      new Args().addString(recipient).serialize(),
      Mas.fromString('0.01'),
      Mas.fromString('0.01'),
      BigInt(4000000000),
    );

    console.log('Operation:', op.returnValue);
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
                  <InputLabel label="Interval" />
                  <RecurrenceDropdown
                    value={interval} // Assuming your dropdown uses IOption interface
                    onRecurrenceChange={(value: number) => {
                      setInterval(value);
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

              <div className="flex mt-4 gap-4">
                <Button variant="secondary" onClick={increaseAllowance}>
                  Allow {Mas.toString(BigInt(amount))} Mas
                </Button>
                <Button variant="secondary" onClick={sendNewSchedule}>
                  Create Schedule
                </Button>
              </div>
            </Card>
          </section>
        )}
      </div>
      <button onClick={() => getBalanceof(recipientAddress)}>
        Get Balance recipient
      </button>

      <button onClick={() => getBalanceof(connectedAccount?.address() || '')}>
        Get Balance connected account
      </button>

      <button
        onClick={() => getSchedulesBySpender(connectedAccount?.address() || '')}
      >
        Get Schedules by spender
      </button>

      <button onClick={() => getScheduleByRecipient(recipientAddress)}>
        Get Schedules by recipient
      </button>
    </div>
  );
}

function InputLabel(props: { label: string }) {
  return <p className="text-sm text-gray-500 mb-2">{props.label}</p>;
}
