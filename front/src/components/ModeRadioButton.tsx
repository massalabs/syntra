import React, { useState } from 'react';
import { FiInfo, FiGift, FiClock } from 'react-icons/fi';

interface ModeRadioButtonProps {
  isVesting: boolean;
  handleModeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mode: string;
  modeDesc: string;
  disabled?: boolean;
}

// Custom wide tooltip component
const WideTooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ 
  content, 
  children 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-flex">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsVisible(!isVisible);
        }}
        className="cursor-help"
      >
        {children}
      </div>
      
      {isVisible && (
        <div 
          className="
            absolute z-50 
            bottom-full left-1/2 -translate-x-1/2 mb-2
            w-72 sm:w-80
            p-3
            bg-gray-900 text-white text-sm
            rounded-lg shadow-xl
            leading-relaxed
            animate-fade-in
          "
        >
          {/* Arrow */}
          <div 
            className="
              absolute -bottom-1.5 left-1/2 -translate-x-1/2
              w-3 h-3 bg-gray-900 
              rotate-45
            " 
          />
          <p className="relative z-10">{content}</p>
        </div>
      )}
    </div>
  );
};

const ModeRadioButton: React.FC<ModeRadioButtonProps> = ({
  isVesting,
  handleModeChange,
  mode,
  modeDesc,
  disabled,
}) => {
  const isTips = mode === 'tips';
  const Icon = isTips ? FiGift : FiClock;

  return (
    <label 
      className={`
        relative flex items-center gap-3 
        px-4 py-3 rounded-xl
        border-2 cursor-pointer
        transition-all duration-200
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:border-primary/50'
        }
        ${isVesting 
          ? 'border-primary bg-primary/5 shadow-sm' 
          : 'border-gray-200 bg-white hover:bg-gray-50'
        }
      `}
    >
      <input
        disabled={disabled}
        type="radio"
        value={mode}
        className="sr-only"
        checked={isVesting}
        onChange={handleModeChange}
      />
      
      {/* Custom Radio Indicator */}
      <span 
        className={`
          w-5 h-5 rounded-full border-2 
          flex items-center justify-center
          transition-all duration-200
          ${isVesting 
            ? 'border-primary' 
            : 'border-gray-300'
          }
        `}
      >
        {isVesting && (
          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
        )}
      </span>

      {/* Icon */}
      <Icon 
        size={18} 
        className={`transition-colors duration-200 ${isVesting ? 'text-primary' : 'text-gray-400'}`} 
      />

      {/* Label */}
      <span 
        className={`
          text-sm font-medium capitalize
          transition-colors duration-200
          ${isVesting ? 'text-primary' : 'text-gray-600'}
        `}
      >
        {mode}
      </span>

      {/* Info Tooltip - Custom wide version */}
      <WideTooltip content={modeDesc}>
        <FiInfo 
          size={14} 
          className={`
            transition-colors duration-200 
            ${isVesting ? 'text-primary/60 hover:text-primary' : 'text-gray-400 hover:text-gray-600'}
          `}
        />
      </WideTooltip>
    </label>
  );
};

export default ModeRadioButton;
