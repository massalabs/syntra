import { useAccountStore } from '@massalabs/react-ui-kit';
import { useTokenStore } from './token';
import { useSchedulerStore } from './scheduler';

export async function initTokens() {
  const { refreshBalances } = useTokenStore.getState();
  refreshBalances();
}

export const initSchedules = async () => {
  const { connectedAccount } = useAccountStore.getState();
  if (!connectedAccount) {
    return;
  }
  useSchedulerStore.getState().getBySpender(connectedAccount.address);
};
