import { useRef } from 'react';
import { NumericInput, RecipientAddressInput, Recurrence } from '@/components';
import { Button, formatAmount, useAccountStore } from '@massalabs/react-ui-kit';
import { ConnectButton } from '@/components/ConnectWalletPopup/ConnectButton';
import { Card } from '@massalabs/react-ui-kit/src/components/Card/Card';
import useSchedule from '@/services/useSchedule';
import useToken from '@/services/useToken';
import ScheduleTable from '@/components/scheduleTable';
import SelectAsset from '@/components/SelectAsset';
import { InputLabel } from '@/components/InputLabel';
import LogoSyntra from '../assets/logo-syntra.svg';
import { arrowButton, commonButton } from '@/styles/buttons';
import { useInit } from '@/services/useInit';

export default function HomePage() {
  useInit();
  const { connectedAccount } = useAccountStore();
  const { scheduleInfo, setScheduleInfo, createSchedule, spenderSchedules } =
    useSchedule();
  const { increaseAllowance } = useToken();
  const scheduleTableRef = useRef<HTMLDivElement>(null);

  const disableAllowanceButton =
    !connectedAccount ||
    scheduleInfo.amount === 0n ||
    !scheduleInfo.asset ||
    (scheduleInfo.asset.allowance ?? 0) >=
      scheduleInfo.amount * scheduleInfo.occurrences;

  const disableCreateScheduleButton =
    !connectedAccount ||
    !scheduleInfo.amount ||
    (scheduleInfo.asset.allowance ?? 0) <
      scheduleInfo.amount * scheduleInfo.occurrences;

  const scrollToList = () => {
    if (scheduleTableRef.current) {
      scheduleTableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
                    disabled={disableAllowanceButton}
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
                    {disableAllowanceButton
                      ? 'Sufficient Allowance'
                      : `Allow ${
                          formatAmount(
                            scheduleInfo.amount * scheduleInfo.occurrences,
                            scheduleInfo.asset.decimals,
                          ).preview
                        } ${scheduleInfo.asset.name}`}
                  </Button>

                  <Button
                    disabled={disableCreateScheduleButton}
                    variant="secondary"
                    onClick={createSchedule}
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
