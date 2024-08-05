import { useAccountStore } from '@massalabs/react-ui-kit';
import { getWallets } from '@massalabs/wallet-provider';

export async function updateWallet() {
  const { setWallets } = useAccountStore.getState();
  const wallets = await getWallets();
  setWallets(wallets);
  return wallets;
}

export async function handleBearbyAccountChange(newAddress: string) {
  const { connectedAccount, currentWallet, setConnectedAccount } =
    useAccountStore.getState();

  const oldAddress = connectedAccount?.address;

  if (newAddress !== oldAddress) {
    const newAccounts = await currentWallet?.accounts();

    if (newAccounts?.length) {
      // Bearby returns only one account
      const newAccount = newAccounts[0];
      setConnectedAccount(newAccount);
    }
  }
}
