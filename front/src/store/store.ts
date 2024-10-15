import { EventPoller, Provider, SCEvent } from '@massalabs/massa-web3';
import { schedulerAddress } from '../const/contracts';
import { Schedule } from '../serializable/Schedule';
import { truncateAddress } from '@/utils/address';
import { useAccountStore, formatAmount, toast } from '@massalabs/react-ui-kit';
import { useSchedulerStore } from './scheduler';
import { useTokenStore } from './token';
import { getTokenInfo } from '@/utils/assets';
import { useNetworkStore } from './network';

export async function initApp() {
  const { connectedAccount } = useAccountStore.getState();
  if (!connectedAccount) return;

  await initTokens();
  await initSchedules(connectedAccount);
  await initPollEvent(connectedAccount);
}

async function initTokens() {
  const { init } = useTokenStore.getState();
  await init();
}

async function initSchedules(connectedAccount: Provider) {
  const { setSchedulerAddress, getBySpender } = useSchedulerStore.getState();
  const { network } = useNetworkStore.getState();
  setSchedulerAddress(schedulerAddress[network]);

  await getBySpender(connectedAccount.address);
}

async function initPollEvent(connectedAccount: Provider) {
  const {
    getBySpender,
    address: schedulerAddress,
    setEventPollerStop,
    eventPollerStop,
  } = useSchedulerStore.getState();

  if (eventPollerStop) eventPollerStop();

  const { lastSlot } = await connectedAccount.getNodeStatus();

  const { stopPolling } = EventPoller.start(
    connectedAccount,
    { smartContractAddress: schedulerAddress, start: lastSlot },
    async (data) => {
      const schedules = await getBySpender(connectedAccount.address);
      if (!schedules?.length) return;

      handleTransferEvents(data, schedules);
    },
  );

  setEventPollerStop(stopPolling);
}

function handleTransferEvents(data: SCEvent[], schedules: Schedule[]) {
  const { refreshBalances } = useTokenStore.getState();
  const { tokens } = useTokenStore.getState();

  for (const event of data) {
    const match = event.data?.match(/Transfer:([^]+)/);
    if (!match) continue;

    const [id] = event.data.split(',');
    const scheduleId = id.split(':')[1];
    const schedule = schedules.find((s) => s.id === BigInt(scheduleId));

    if (schedule) {
      const { decimals, symbol } = getTokenInfo(schedule.tokenAddress, tokens);
      const formattedAmount = formatAmount(schedule.amount, decimals).preview;

      toast.success(
        `Transfer: ${truncateAddress(
          schedule.recipient,
        )} received ${formattedAmount} ${symbol}`,
      );

      refreshBalances();
    }
  }
}
