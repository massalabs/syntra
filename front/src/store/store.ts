import { EventPoller, Provider, SCEvent } from '@massalabs/massa-web3';
import { schedulerAddress } from '../const/contracts';
import { Schedule } from '../serializable/Schedule';
import { truncateAddress } from '@/utils/address';
import { formatAmount, toast } from '@massalabs/react-ui-kit';
import { useSchedulerStore } from './scheduler';
import { useTokenStore } from './token';
import { getTokenInfo } from '@/utils/assets';
import { AvailableNetwork, useNetworkStore } from './network';
import { supportedTokens } from '@/const/assets';

export async function initApp(
  connectedAccount: Provider,
  walletNetwork: AvailableNetwork,
) {
  const { network: appNetwork } = useNetworkStore.getState();

  await initSchedules(connectedAccount, walletNetwork, appNetwork);
  await initTokens(walletNetwork, appNetwork);
  await initPollEvent(connectedAccount);
}

async function initTokens(
  network: AvailableNetwork,
  appNetwork: AvailableNetwork,
) {
  const { setTokens, refreshBalances } = useTokenStore.getState();
  setTokens(supportedTokens[network]);
  if (network !== appNetwork) return;
  refreshBalances();
}

export async function initSchedules(
  connectedAccount: Provider,
  walletNetwork: AvailableNetwork,
  appNetwork: AvailableNetwork,
) {
  const {
    setSchedulerAddress,
    getUserPayments,
    getUserReceive,
    setUserPayments,
    setUserReceive,
  } = useSchedulerStore.getState();
  if (appNetwork !== walletNetwork) {
    setUserPayments([]);
    setUserReceive([]);
    return;
  }

  setSchedulerAddress(schedulerAddress[appNetwork]);
  await getUserPayments(connectedAccount.address);
  await getUserReceive(connectedAccount.address);
}

async function initPollEvent(connectedAccount: Provider) {
  const {
    getUserPayments,
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
      const schedules = await getUserPayments(connectedAccount.address);
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
