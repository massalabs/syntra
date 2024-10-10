import { EventPoller, Provider, SCEvent } from '@massalabs/massa-web3';
import { schedulerAddress } from '../const/contracts';
import { Schedule } from '../serializable/Schedule';
import { supportedTokens } from '../const/assets';
import { truncateAddress } from '@/utils/address';
import { useAccountStore, formatAmount, toast } from '@massalabs/react-ui-kit';
import { useSchedulerStore } from './scheduler';
import { useTokenStore } from './token';

export async function initApp() {
  const { connectedAccount } = useAccountStore.getState();
  if (!connectedAccount) return;

  await Promise.all([
    initTokens(),
    initSchedules(connectedAccount),
    initPollEvent(connectedAccount),
  ]);
}

async function initTokens() {
  const { refreshBalances } = useTokenStore.getState();
  await refreshBalances();
}

async function initSchedules(connectedAccount: Provider) {
  const { setSchedulerAddress, getBySpender } = useSchedulerStore.getState();
  setSchedulerAddress(schedulerAddress);
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

  for (const event of data) {
    const match = event.data?.match(/Transfer:([^]+)/);
    if (!match) continue;

    const [id] = event.data.split(',');
    const scheduleId = id.split(':')[1];
    const schedule = schedules.find((s) => s.id === BigInt(scheduleId));

    if (schedule) {
      const { decimals, symbol } = getTokenInfo(schedule.tokenAddress);
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

function getTokenInfo(tokenAddress: string | null) {
  if (!tokenAddress) return { decimals: 9, symbol: 'MAS' };

  const token = supportedTokens.find((t) => t.address === tokenAddress);
  return token
    ? { decimals: token.decimals, symbol: token.symbol }
    : { decimals: 9, symbol: 'MAS' };
}
