import {
  ConnectMassaWallet,
  PopupModal,
  PopupModalContent,
  PopupModalHeader,
} from '@massalabs/react-ui-kit';
import Intl from '@/i18n/i18n';

interface ConnectWalletPopupProps {
  setOpen: (open: boolean) => void;
}

export function ConnectWalletPopup(props: ConnectWalletPopupProps) {
  const { setOpen } = props;

  return (
    <PopupModal
      customClass="w-1/3 min-w-[470px] max-w-[700px]"
      customClassNested="border border-tertiary bg-secondary/50 backdrop-blur-lg"
      fullMode={true}
      onClose={() => setOpen(false)}
    >
      <PopupModalHeader>
        <div className="text-f-primary flex flex-col mb-4">
          <label className="mas-title mb-4">
            {Intl.t('connect-wallet.title')}
          </label>
        </div>
      </PopupModalHeader>
      <PopupModalContent>
        <div className="col-span-2">
          <WalletCard>
            <ConnectMassaWallet />
          </WalletCard>
        </div>
      </PopupModalContent>
    </PopupModal>
  );
}

export function WalletCard({ ...props }) {
  const { children } = props;

  return (
    <div className="bg-deep-blue p-6 rounded-2xl flex flex-col justify-center items-center ">
      <div className="flex flex-col w-full mas-body">{children}</div>
    </div>
  );
}
