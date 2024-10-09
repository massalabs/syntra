import { ConnectButton } from './ConnectWalletPopup';
import LogoSyntra from '../assets/logo-syntra.svg';

export function NavBar() {
  return (
    <nav className="flex justify-between items-center px-10 py-5 w-full">
      <img src={LogoSyntra} alt="Syntra" className="w-40 h-20" />
      <ConnectButton />
    </nav>
  );
}
