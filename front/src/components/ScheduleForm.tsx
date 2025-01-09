import { parseUnits } from '@massalabs/massa-web3';
import { useAccountStore } from '@massalabs/react-ui-kit';
import { Card } from '@massalabs/react-ui-kit/src/components/Card/Card';
import { RecipientAddressInput } from './RecipientAddressInput';
import { Recurrence } from './Recurrence';
import { SelectAmount } from './SelectAmount';
import SelectAsset from './SelectAsset';
import { SelectMode } from './SelectMode';
import { useTokenStore } from '@/store/token';
import { isValidAddress } from '@/utils/address';
import { useState } from 'react';
import { AllowanceButton } from './AllowanceButton';
import { tipsModeDesc, vestingModeDesc } from '@/const/tooltips';
import { RepeatInput } from './RepeatInput';
import { CreateScheduleButton } from './CreateScheduleButton';

import { useSchedulerStore } from '@/store/scheduler';
import { useDappNetworkStore } from '@/store/network';

export function ScheduleForm() {
  const { connectedAccount, network: walletNetwork } = useAccountStore();
  const { scheduleInfo, setScheduleInfo } = useSchedulerStore();
  const { tokens } = useTokenStore();
  const { network: dappNetwork } = useDappNetworkStore();
  const [isVesting, setVesting] = useState<boolean>(scheduleInfo.isVesting);

  const selectedToken = tokens.find(
    (token) => token.address === scheduleInfo.asset.address,
  );
  const isMasToken = scheduleInfo.asset.address === '';
  const isValidRecipient = isValidAddress(scheduleInfo.recipient);

  const balance = selectedToken?.balance ?? 0n;
  const insufficientBalance = balance < scheduleInfo.amount;

  const isAllowanceSufficient =
    (selectedToken?.allowance ?? 0) >=
    scheduleInfo.amount * scheduleInfo.occurrences;

  const disableAllowanceButton = [
    !isValidRecipient,
    !connectedAccount,
    scheduleInfo.amount === 0n,
    !scheduleInfo.asset,
    isAllowanceSufficient,
    insufficientBalance,
    isMasToken,
    isVesting,
  ].some(Boolean);

  const disableCreateScheduleButton = [
    !isValidRecipient,
    !connectedAccount,
    scheduleInfo.amount === 0n,
    !isAllowanceSufficient && !isMasToken,
  ].some(Boolean);

  const isRightNetwork = dappNetwork === walletNetwork?.name;
  const formDisabled = !connectedAccount || !isRightNetwork;

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

  function renderError() {
    if (!connectedAccount) {
      return (
        <p className="text-red-500 text-center p-6 font-Poppins font-bold text-xl">
          Please connect your wallet
        </p>
      );
    }
    if (!isRightNetwork) {
      return (
        <p className="text-red-500 text-center p-6 font-Poppins font-bold text-xl">
          Please switch your wallet to {dappNetwork}
        </p>
      );
    }
  }
  return (
    <section className="max-w-2xl w-full mx-auto rounded-2xl shadow-lg p-7 bg-white">
      {renderError()}
      <Card customClass="bg-transparent grid grid-flow-row gap-4">
        <SelectMode
          isVesting={isVesting}
          handleModeChange={handleModeChange}
          tipsModeDesc={tipsModeDesc}
          vestingModeDesc={vestingModeDesc}
          disabled={formDisabled}
        />

        <div className="grid grid-cols-6 gap-2">
          <div className="col-span-4">
            <SelectAmount
              scheduleInfo={scheduleInfo}
              onValueChange={(amount: string) => {
                setScheduleInfo(
                  'amount',
                  parseUnits(amount, scheduleInfo.asset.decimals),
                );
              }}
              disabled={formDisabled}
            />
          </div>
          <div className="col-span-2">
            <SelectAsset isVesting={isVesting} disabled={formDisabled} />
          </div>
        </div>

        <div>
          <RecipientAddressInput
            value={scheduleInfo.recipient}
            onAddressChange={(address) => {
              setScheduleInfo('recipient', address);
            }}
            disabled={formDisabled}
          />
        </div>

        <div className="grid grid-cols-6 gap-2">
          <div className="col-span-3">
            <Recurrence
              onRecurrenceChange={(value: bigint) => {
                setScheduleInfo('interval', BigInt(value));
              }}
              disabled={formDisabled}
            />
          </div>

          <div className="col-start-6 col-span-1">
            <RepeatInput
              occurrences={scheduleInfo.occurrences.toString()}
              onValueChange={(value: string) => {
                setScheduleInfo('occurrences', BigInt(value));
              }}
              disabled={formDisabled}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <AllowanceButton
            disabled={disableAllowanceButton}
            scheduleInfo={scheduleInfo}
          />
          <CreateScheduleButton disabled={disableCreateScheduleButton} />
        </div>
      </Card>
    </section>
  );
}
