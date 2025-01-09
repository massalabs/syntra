import { EventPoller, Provider, rpcTypes } from '@massalabs/massa-web3';
import { schedulerAddress } from '../const/contracts';
import { Schedule } from '../serializable/Schedule';
import { truncateAddress } from '@/utils/address';
import { formatAmount, toast } from '@massalabs/react-ui-kit';
import { useSchedulerStore } from './scheduler';
import { useTokenStore } from './token';
import { getTokenInfo } from '@/utils/assets';
import { supportedTokens } from '@/const/assets';
import { AvailableNetwork, useDappNetworkStore } from './network';

export async function resetApp() {
  const { setUserPayments, setUserReceive } = useSchedulerStore.getState();
  setUserPayments([]);
  setUserReceive([]);
}

export async function initApp(
  connectedAccount: Provider,
  walletNetwork: AvailableNetwork,
) {
  await initTokens(walletNetwork);
  await initPollEvent(connectedAccount);
  await initSchedules(connectedAccount, walletNetwork);
}

async function initTokens(network: AvailableNetwork) {
  const { setTokens, refreshBalances } = useTokenStore.getState();
  const { network: dappNetwork } = useDappNetworkStore.getState();
  setTokens(supportedTokens[dappNetwork]);
  if (network !== dappNetwork) return;
  refreshBalances();
}

export async function initSchedules(
  connectedAccount: Provider,
  walletNetwork: AvailableNetwork,
) {
  const { setSchedulerAddress, getUserPayments, getUserReceive } =
    useSchedulerStore.getState();
  const { network: dappNetwork } = useDappNetworkStore.getState();

  if (dappNetwork !== walletNetwork) {
    resetApp();
    return;
  }

  setSchedulerAddress(schedulerAddress[dappNetwork]);
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

function handleTransferEvents(
  data: rpcTypes.OutputEvents,
  schedules: Schedule[],
) {
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
