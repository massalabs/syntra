import { formatAmount, toast, useAccountStore } from '@massalabs/react-ui-kit';
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
    async (data) => {
      for (const event of data) {
        const match = event.data.match(/Transfer:([^]+)/);
        if (match) {
          const schedules = await getBySpender(connectedAccount.address);
          if (schedules) {
            const info = event.data.split(',');
            const id = info[0].split(':')[1];
            const schedule = schedules.find((s) => s.id === BigInt(id));
            if (schedule) {
              toast.success(
                `Transfer: ${schedule.recipient} received  ${
                  formatAmount(schedule.amount).preview
                } MAS`,
              );
              refreshBalances();
            }
          }
        }
      }
    },
  );

  setEventPollerStop(stopPolling);
};
