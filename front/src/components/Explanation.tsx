import { IoIosClose } from 'react-icons/io';
import { FiZap, FiClock, FiShield } from 'react-icons/fi';

type IntroProps = {
  onClose: () => void;
};

export const Intro = ({ onClose }: IntroProps) => {
  return (
    <div 
      className="
        relative mx-4 sm:mx-auto max-w-2xl mt-4
        bg-white/90 backdrop-blur-md 
        rounded-2xl shadow-lg 
        border border-white/50
        overflow-hidden
        animate-slide-up
      "
    >
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary" />
      
      <div className="p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4
            p-1.5 rounded-full
            text-gray-400 hover:text-gray-600 hover:bg-gray-100
            transition-colors duration-150
          "
          aria-label="Close"
        >
          <IoIosClose size={22} />
        </button>

        {/* Content */}
        <div className="text-center pr-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3 font-Urbane">
            Welcome to Syntra
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            A cutting-edge dApp powered by Massa's autonomous smart contracts, 
            designed to simplify token scheduling like never before.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
          <FeatureItem 
            icon={<FiZap className="text-primary" size={18} />}
            label="Automated"
          />
          <FeatureItem 
            icon={<FiClock className="text-primary" size={18} />}
            label="Scheduled"
          />
          <FeatureItem 
            icon={<FiShield className="text-primary" size={18} />}
            label="Secure"
          />
        </div>
      </div>
    </div>
  );
};

function FeatureItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-gray-600">
      <div className="p-2 bg-primary/10 rounded-lg">
        {icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
