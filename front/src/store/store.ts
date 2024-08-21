import { useTokenStore } from './token';

export async function initTokens() {
  const { refreshBalances } = useTokenStore.getState();
  refreshBalances();
}
