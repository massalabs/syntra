import { Button, useAccountStore } from '@massalabs/react-ui-kit';
import Intl from '@/i18n/i18n';
import { useState } from 'react';
import { ConnectWalletPopup } from './ConnectWalletPopup';
import { truncateAddress } from '@/utils/address';

export function ConnectButton() {
  const [open, setOpen] = useState(false);
  const { connectedAccount, isFetching } = useAccountStore();

  const showPingAnimation = !connectedAccount;

  function ConnectedWallet() {
    return (
      <Button
        disabled={isFetching}
        variant="secondary"
        customClass="h-[54px] text-primary dark:text-primary relative"
        onClick={() => setOpen(true)}
      >
        {truncateAddress(connectedAccount?.address)}
        {showPingAnimation && <PingAnimation />}
      </Button>
    );
  }

  function NotConnectedWallet() {
    return (
      <>
        <Button
          variant="secondary"
          disabled={isFetching}
          customClass="h-[54px] text-primary dark:text-primary relative"
          onClick={() => setOpen(true)}
        >
          {Intl.t('connect-wallet.title')}
          {showPingAnimation && <PingAnimation />}
        </Button>
      </>
    );
  }
  return (
    <>
      <div className="top-10 right-10 shadow-md rounded-lg border-primary border ">
        {connectedAccount ? <ConnectedWallet /> : <NotConnectedWallet />}
      </div>

      {open && <ConnectWalletPopup setOpen={setOpen} />}
    </>
  );
}

function PingAnimation() {
  return (
    <span className="absolute flex h-3 w-3 top-0 right-0 -mr-2 -mt-2">
      <span
        className="animate-ping absolute inline-flex h-full w-full
                    rounded-full bg-s-error opacity-75 "
      ></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-s-error"></span>
    </span>
  );
}
