import { toast, useAccountStore } from '@massalabs/react-ui-kit';
import { useTokenStore } from './token';
import { useSchedulerStore } from './scheduler';
import { config } from '@/const/config';
import { CHAIN_ID, EventPoller, Provider } from '@massalabs/massa-web3';

const chainId = CHAIN_ID.Buildnet.toString();

export async function initApp() {
  const { connectedAccount } = useAccountStore.getState();
  if (!connectedAccount) {
    return;
  }
  initTokens();
  initSchedules(connectedAccount);
  initPollEvent(connectedAccount);
}

export async function initTokens() {
  const { refreshBalances } = useTokenStore.getState();
  refreshBalances();
}

export const initSchedules = async (connectedAccount: Provider) => {
  useSchedulerStore
    .getState()
    // Todo fix chain id never initialized in ui-kit
    .setSchedulerAddress(config[chainId].SchedulerContract);
  useSchedulerStore.getState().getBySpender(connectedAccount.address);
};

// Todo - For now this will poll every transfer. We need to filter by spender
// Except if we want to showcase all transfers and make nice animation on each transfer
export const initPollEvent = async (connectedAccount: Provider) => {
  const {
    getBySpender,
    address: schedulerAddress,
    setEventPollerStop,
    eventPollerStop,
  } = useSchedulerStore.getState();

  if (eventPollerStop) eventPollerStop();

  const { refreshBalances } = useTokenStore.getState();
  const { lastSlot } = await connectedAccount.getNodeStatus();

  const { stopPolling } = EventPoller.start(
    connectedAccount,
    {
      smartContractAddress: schedulerAddress,
      start: lastSlot,
    },
    (data) => {
      for (const event of data) {
        const match = event.data.match(/Transfer:([^]+)/);
        if (match) {
          toast.success(event.data);
          getBySpender(connectedAccount.address);
          refreshBalances();
        }
      }
    },
  );

  setEventPollerStop(stopPolling);
};
