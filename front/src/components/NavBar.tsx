import { ConnectButton } from './ConnectWalletPopup';
import LogoSyntra from '../assets/logo-syntra.svg';
import { useDappNetworkStore } from '@/store/network';
import { Button } from '@massalabs/react-ui-kit';
import { useState } from 'react';
import { FiSettings } from 'react-icons/fi';

export function NavBar() {
  const { network } = useDappNetworkStore();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <nav className="flex justify-between items-center px-10 py-5 w-full">
      <div className="flex flex-col">
        <img src={LogoSyntra} alt="Syntra" className="w-40 h-14" />
        <p className="font-caveat text-white self-end -m-5 flex items-center gap-1">
          {network === 'mainnet' ? 'Mainnet' : 'Buildnet'}
        </p>
      </div>
      <div className="flex items-center relative gap-2">
        <SettingsButton onClick={() => setShowSettings((prev) => !prev)} />
        {showSettings && <Settings onClose={() => setShowSettings(false)} />}
        <ConnectButton />
      </div>
    </nav>
  );
}

type SettingsButtonProps = {
  onClick: () => void;
};

export function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <Button
      className="px-2 py-3 hover:rotate-180 transition-transform ease-linear duration-300 bg-transparent"
      onClick={onClick}
    >
      <FiSettings size={15} className="hover sm:text-primary" />
    </Button>
  );
}

type SettingsProps = {
  onClose: () => void;
};

function Settings({ onClose }: SettingsProps) {
  const { switchNetwork, network } = useDappNetworkStore();

  const handleNetworkSwitch = () => {
    switchNetwork();
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black opacity-50 z-10"
        onClick={onClose}
      ></div>
      <div
        className="absolute top-10 -left-52 bg-white rounded-xl 
                   shadow-lg z-20 text-primary border border-slate-600 overflow-hidden"
      >
        <div className="p-3 flex justify-center bg-primary text-white cursor-default select-none">
          Settings
        </div>
        <Button
          onClick={handleNetworkSwitch}
          className="p-5 rounded-none transition-colors duration-100 hover:bg-slate-100"
        >
          Switch Dapp to {network === 'mainnet' ? 'Buildnet' : 'Mainnet'}
        </Button>
      </div>
    </>
  );
}
