import { useAccountStore } from '@massalabs/react-ui-kit';
import Intl from '@/i18n/i18n';
import { useState } from 'react';
import { ConnectWalletPopup } from './ConnectWalletPopup';
import { truncateAddress } from '@/utils/address';
import { FiUser, FiLogIn } from 'react-icons/fi';

export function ConnectButton() {
  const [open, setOpen] = useState(false);
  const { connectedAccount, isFetching } = useAccountStore();

  return (
    <>
      <button
        disabled={isFetching}
        onClick={() => setOpen(true)}
        className={`
          flex items-center gap-2.5
          px-4 py-2.5
          bg-white/90 backdrop-blur-sm
          border border-gray-200
          rounded-xl
          shadow-sm
          transition-all duration-200 ease-out
          hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5
          active:translate-y-0 active:shadow-sm
          disabled:opacity-50 disabled:cursor-not-allowed
          group
        `}
      >
        {connectedAccount ? (
          <>
            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <FiUser size={16} className="text-primary" />
            </span>
            <span className="font-medium text-gray-700 font-mono text-sm">
              {truncateAddress(connectedAccount?.address)}
            </span>
            <span className="w-2 h-2 rounded-full bg-green-500" />
          </>
        ) : (
          <>
            <FiLogIn 
              size={18} 
              className="text-primary transition-transform duration-200 group-hover:translate-x-0.5" 
            />
            <span className="font-medium text-primary">
              {Intl.t('connect-wallet.title')}
            </span>
          </>
        )}
      </button>

      {open && <ConnectWalletPopup setOpen={setOpen} />}
    </>
  );
}
