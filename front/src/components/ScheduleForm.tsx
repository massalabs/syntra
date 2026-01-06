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
  const { scheduleInfo, setScheduleInfo, isCreatingSchedule } =
    useSchedulerStore();
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
    isCreatingSchedule,
  ].some(Boolean);

  const disableCreateScheduleButton = [
    !isValidRecipient,
    !connectedAccount,
    scheduleInfo.amount === 0n,
    !isAllowanceSufficient && !isMasToken,
    isCreatingSchedule,
  ].some(Boolean);

  const isRightNetwork = dappNetwork === walletNetwork?.name;
  const formDisabled = !connectedAccount || !isRightNetwork || isCreatingSchedule;

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
        <div className="mx-7 mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-amber-700 text-center font-medium flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            Please connect your wallet to continue
          </p>
        </div>
      );
    }
    if (!isRightNetwork) {
      return (
        <div className="mx-7 mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-amber-700 text-center font-medium flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            Please switch your wallet to {dappNetwork}
          </p>
        </div>
      );
    }
  }
  return (
    <section 
      className="
        max-w-2xl w-full mx-4 sm:mx-auto 
        rounded-2xl shadow-xl 
        bg-white/95 backdrop-blur-sm
        border border-gray-100
        overflow-hidden
        animate-fade-in
      "
    >
      {/* Form Header */}
      <div className="px-7 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <h2 className="text-lg font-semibold text-gray-800 font-Urbane">
          Create Schedule
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Set up automated token transfers
        </p>
      </div>

      {/* Error Messages */}
      {renderError()}

      {/* Form Content */}
      <div className="p-7">
        <Card customClass="bg-transparent grid grid-flow-row gap-6">
          {/* Mode Selection */}
          <SelectMode
            isVesting={isVesting}
            handleModeChange={handleModeChange}
            tipsModeDesc={tipsModeDesc}
            vestingModeDesc={vestingModeDesc}
            disabled={formDisabled}
          />

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          {/* Amount & Asset */}
          <div className="grid grid-cols-6 gap-3">
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

          {/* Recipient */}
          <div>
            <RecipientAddressInput
              value={scheduleInfo.recipient}
              onAddressChange={(address) => {
                setScheduleInfo('recipient', address);
              }}
              disabled={formDisabled}
            />
          </div>

          {/* Recurrence & Repeat */}
          <div className="grid grid-cols-6 gap-3">
            <div className="col-span-4">
              <Recurrence
                onRecurrenceChange={(value: bigint) => {
                  setScheduleInfo('interval', BigInt(value));
                }}
                disabled={formDisabled}
              />
            </div>

            <div className="col-span-2">
              <RepeatInput
                occurrences={scheduleInfo.occurrences.toString()}
                onValueChange={(value: string) => {
                  setScheduleInfo('occurrences', BigInt(value));
                }}
                disabled={formDisabled}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <AllowanceButton
              disabled={disableAllowanceButton}
              scheduleInfo={scheduleInfo}
            />
            <CreateScheduleButton disabled={disableCreateScheduleButton} />
          </div>
        </Card>
      </div>
    </section>
  );
}
