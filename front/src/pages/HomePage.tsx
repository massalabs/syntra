import { useRef, useState } from 'react';
import { NumericInput, RecipientAddressInput, Recurrence } from '@/components';
import {
  Button,
  formatAmount,
  toast,
  Tooltip,
  useAccountStore,
} from '@massalabs/react-ui-kit';
import { ConnectButton } from '@/components/ConnectWalletPopup/ConnectButton';
import { Card } from '@massalabs/react-ui-kit/src/components/Card/Card';
import useSchedule from '@/services/useSchedule';
import useToken from '@/services/useToken';
import ScheduleTable from '@/components/scheduleTable';
import SelectAsset from '@/components/SelectAsset';
import { InputLabel } from '@/components/InputLabel';
import LogoSyntra from '../assets/logo-syntra.svg';
import { arrowButton, commonButton } from '@/styles/buttons';
import { parseUnits } from '@massalabs/massa-web3';
import { FiInfo } from 'react-icons/fi';
import { isValidAddress } from '../utils/address';
import { useSearchParams } from 'react-router-dom';
import { useTokenStore } from '../store/token';

export default function HomePage() {
  const { connectedAccount } = useAccountStore();
  const { scheduleInfo, setScheduleInfo, createSchedule, spenderSchedules } =
    useSchedule();
  const { increaseAllowance } = useToken();
  const { tokens } = useTokenStore();

  const scheduleTableRef = useRef<HTMLDivElement>(null);
  const [isVesting, setVesting] = useState<boolean>(scheduleInfo.isVesting);

  const selectedToken = tokens.find(
    (token) => token.address === scheduleInfo.asset.address,
  );
  const isMasToken = scheduleInfo.asset.address === '';

  const [searchParams] = useSearchParams();
  const recipientQuery = searchParams.get('recipient');
  if (recipientQuery && scheduleInfo.recipient == '') {
    setScheduleInfo('recipient', recipientQuery);
  }

  const isValidRecipient = isValidAddress(scheduleInfo.recipient);

  const balance = selectedToken?.balance ?? 0n;
  const insufficientBalance = balance < scheduleInfo.amount;

  const disableAllowanceButton =
    !isValidRecipient ||
    !connectedAccount ||
    scheduleInfo.amount === 0n ||
    !scheduleInfo.asset ||
    (selectedToken?.allowance ?? 0) >=
      scheduleInfo.amount * scheduleInfo.occurrences ||
    insufficientBalance ||
    isMasToken;

  const disableCreateScheduleButton =
    !isValidRecipient ||
    !connectedAccount ||
    !scheduleInfo.amount ||
    ((selectedToken?.allowance ?? 0) <
      scheduleInfo.amount * scheduleInfo.occurrences &&
      !isMasToken);

  const scrollToList = () => {
    if (scheduleTableRef.current) {
      scheduleTableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCreateSchedule = async () => {
    try {
      createSchedule();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create schedule');
    }
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const value = e.target.value;

    setScheduleInfo('amount', 0n);
    if (isChecked) {
      const isVesting = value === 'vesting';
      setVesting(isVesting);
      setScheduleInfo('isVesting', isVesting);
    }
  };

  const tipsModeDesc = `Once spending approval is given to the scheduler contract,
   tokens are sent to the recipient address at the specified interval. 
  You are not required to old the total amount of tokens (amount * nbOccurences) in your wallet.`;

  const vestingModeDesc = `Using vesting mode will require to lock the total amount of tokens (amount * nbOccurences)
   in the scheduler contract.`;

  return (
    <>
      <div className="main h-screen">
        <nav className="flex justify-between items-center px-10 py-5 w-full">
          <img src={LogoSyntra} alt="Syntra" className="w-40 h-20" />
          <ConnectButton />
        </nav>

        {connectedAccount && (
          <div className="flex flex-col justify-center items-center gap-10 h-full">
            <section className="max-w-2xl w-full mx-auto rounded-2xl shadow-lg p-7 bg-white -mt-40">
              <Card customClass="bg-transparent grid grid-flow-row gap-4 ">
                <div className="flex justify-left items-center gap-4">
                  <InputLabel label="Mode:" />
                  <div className="flex items-center gap-10 mb-2 mx-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="tips"
                        checked={!isVesting}
                        onChange={(e) => handleModeChange(e)}
                      />
                      <p className="text-sm text-gray-700">Tips</p>
                      <Tooltip customClass="py-2" body={tipsModeDesc}>
                        <FiInfo className="mr-1" size={12} />
                      </Tooltip>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="vesting"
                        checked={isVesting}
                        onChange={(e) => handleModeChange(e)}
                      />
                      <p className="text-sm text-gray-700">Vesting</p>
                      <Tooltip customClass="py-2" body={vestingModeDesc}>
                        <FiInfo className="mr-1" size={12} />
                      </Tooltip>
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  <div className="col-span-4">
                    <InputLabel label={'Amount'} />
                    <NumericInput
                      placeholder="Enter your amount"
                      onValueChange={(amount: string) => {
                        setScheduleInfo(
                          'amount',
                          parseUnits(amount, scheduleInfo.asset.decimals),
                        );
                      }}
                      asset={scheduleInfo.asset}
                      value={
                        formatAmount(
                          scheduleInfo.amount,
                          scheduleInfo.asset.decimals,
                        ).full
                      }
                    />
                  </div>

                  <div className="col-span-2">
                    <InputLabel label="Token" />
                    <SelectAsset isVesting={isVesting} />
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
                      onValueChange={(value: string) => {
                        setScheduleInfo('occurrences', BigInt(value));
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-rows-2 gap-2 mt-5">
                  {!disableAllowanceButton && (
                    <Button
                      variant="secondary"
                      onClick={() =>
                        increaseAllowance(
                          scheduleInfo.amount * scheduleInfo.occurrences,
                        )
                      }
                      customClass={[
                        'border-primary text-primary ',
                        ...commonButton,
                      ].join(' ')}
                    >
                      {`Allow spending ${
                        formatAmount(
                          scheduleInfo.amount * scheduleInfo.occurrences,
                          scheduleInfo.asset.decimals,
                        ).preview
                      } ${scheduleInfo.asset.name}`}
                    </Button>
                  )}

                  <Button
                    disabled={disableCreateScheduleButton}
                    variant="secondary"
                    onClick={handleCreateSchedule}
                    customClass={[
                      'bg-primary text-white',
                      ...commonButton,
                    ].join(' ')}
                  >
                    Create Schedule
                  </Button>
                </div>
              </Card>
            </section>
            <button className={arrowButton.join(' ')} onClick={scrollToList}>
              ↓
            </button>
          </div>
        )}
      </div>

      <div ref={scheduleTableRef} className="h-screen bg-white">
        {spenderSchedules.length > 0 ? (
          <ScheduleTable schedules={spenderSchedules} />
        ) : (
          <div className="text-center text-gray-500">No schedules found</div>
        )}
      </div>
    </>
  );
}
