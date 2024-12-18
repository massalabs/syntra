import { ConnectButton } from './ConnectWalletPopup';
import LogoSyntra from '../assets/logo-syntra.svg';
import { dappNetwork } from '@/const/network';

export function NavBar() {
  return (
    <nav className="flex justify-between items-center px-10 py-5 w-full">
      <div className="flex flex-col">
        <img src={LogoSyntra} alt="Syntra" className="w-40 h-14" />
        <p className="font-caveat text-white self-end -m-5 first-letter:uppercase">
          {dappNetwork}
        </p>
      </div>
      <ConnectButton />
    </nav>
  );
}
