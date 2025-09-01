import {
  EventPoller,
  NetworkName,
  Provider,
  rpcTypes,
} from '@massalabs/massa-web3';
import { Schedule } from '../serializable/Schedule';
import { truncateAddress } from '@/utils/address';
import { formatAmount, toast } from '@massalabs/react-ui-kit';
import { useSchedulerStore } from './scheduler';
import { useTokenStore } from './token';
import { getTokenInfo } from '@/utils/assets';
import { supportedTokens } from '@/const/assets';
import { useDappNetworkStore } from './network';
import { getAllContractAddresses } from '@/const/contracts';

export async function resetApp() {
  const { setUserPayments, setUserReceive } = useSchedulerStore.getState();
  setUserPayments([]);
  setUserReceive([]);
}

export async function initApp(
  connectedAccount: Provider,
  walletNetwork: NetworkName,
) {
  await initTokens(walletNetwork);
  await initPollEvent(connectedAccount);
  await initSchedules(connectedAccount, walletNetwork);
}

async function initTokens(network: NetworkName) {
  const { setTokens, refreshBalances } = useTokenStore.getState();
  const { network: dappNetwork } = useDappNetworkStore.getState();
  setTokens(supportedTokens[dappNetwork as keyof typeof supportedTokens]);
  if (network !== dappNetwork) return;
  refreshBalances();
}

export async function initSchedules(
  connectedAccount: Provider,
  walletNetwork: NetworkName,
) {
  const { getAllUserPayments, getAllUserReceive } =
    useSchedulerStore.getState();
  const { network: dappNetwork } = useDappNetworkStore.getState();

  if (dappNetwork !== walletNetwork) {
    resetApp();
    return;
  }

  await getAllUserPayments(connectedAccount.address);
  await getAllUserReceive(connectedAccount.address);
}

async function initPollEvent(connectedAccount: Provider) {
  const { getAllUserPayments, setEventPollerStop, eventPollerStop } =
    useSchedulerStore.getState();

  const { network } = useDappNetworkStore.getState();

  if (eventPollerStop) eventPollerStop();

  const { lastSlot } = await connectedAccount.getNodeStatus();

  // Poll all contract addresses for events
  const contractAddresses = getAllContractAddresses(network);

  const eventPollers = contractAddresses.map((address) =>
    EventPoller.start(
      connectedAccount,
      { smartContractAddress: address, start: lastSlot },
      async (data) => {
        const schedules = await getAllUserPayments(connectedAccount.address);
        if (!schedules?.length) return;

        handleTransferEvents(
          data,
          schedules.map((s) => s.schedule),
        );
      },
    ),
  );

  const stopAllPolling = () => {
    eventPollers.forEach((poller) => poller.stopPolling());
  };

  setEventPollerStop(stopAllPolling);
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
