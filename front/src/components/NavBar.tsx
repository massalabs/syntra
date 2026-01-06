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
    <nav className="flex justify-between items-center px-6 sm:px-10 py-4 sm:py-5 w-full">
      <div className="flex items-center gap-3">
        <img 
          src={LogoSyntra} 
          alt="Syntra" 
          className="w-32 sm:w-40 h-auto transition-transform duration-200 hover:scale-[1.02]"
          style={{
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15)) drop-shadow(0 0 1px rgba(0,0,0,0.1))'
          }}
        />
        <span 
          className={`
            px-2.5 py-1 text-xs font-medium rounded-full
            transition-colors duration-200
            ${network === 'mainnet' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-amber-100 text-amber-700'
            }
          `}
        >
          {network === 'mainnet' ? 'Mainnet' : 'Buildnet'}
        </span>
      </div>
      <div className="flex items-center relative gap-3">
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
    <button
      className="
        p-2.5 rounded-full bg-white/80 backdrop-blur-sm
        border border-gray-200 shadow-sm
        hover:bg-white hover:shadow-md hover:border-primary/30
        active:scale-95
        transition-all duration-200 ease-out
        group
      "
      onClick={onClick}
      aria-label="Settings"
    >
      <FiSettings 
        size={18} 
        className="text-gray-600 group-hover:text-primary group-hover:rotate-90 transition-all duration-300" 
      />
    </button>
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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-10 animate-fade-in"
        onClick={onClose}
      />
      <div
        className="
          absolute top-14 right-0 
          bg-white rounded-xl shadow-xl z-20 
          border border-gray-100 
          overflow-hidden min-w-[220px]
          animate-slide-up
        "
      >
        <div className="px-4 py-3 bg-gradient-to-r from-primary to-primary/90 text-white font-medium text-sm">
          Settings
        </div>
        <div className="p-2">
          <button
            onClick={handleNetworkSwitch}
            className="
              w-full px-4 py-3 rounded-lg text-left text-sm
              text-gray-700 hover:bg-gray-50 hover:text-primary
              transition-colors duration-150
              flex items-center gap-2
            "
          >
            <span className="w-2 h-2 rounded-full bg-primary/60" />
            Switch to {network === 'mainnet' ? 'Buildnet' : 'Mainnet'}
          </button>
        </div>
      </div>
    </>
  );
}
