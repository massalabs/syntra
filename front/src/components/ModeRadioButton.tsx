import React from 'react';

import { Tooltip } from '@massalabs/react-ui-kit';
import { FiInfo } from 'react-icons/fi';

interface ModeRadioButtonProps {
  isVesting: boolean;
  handleModeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mode: string;
  modeDesc: string;
  disabled?: boolean;
}

const ModeRadioButton: React.FC<ModeRadioButtonProps> = ({
  isVesting,
  handleModeChange,
  mode,
  modeDesc,
  disabled,
}) => {
  return (
    <label className="flex items-center gap-2">
      <input
        disabled={disabled}
        type="radio"
        value={mode}
        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 
            focus:ring-primary dark:focus:ring-primary 
            dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 
            dark:border-gray-600 disabled:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        checked={isVesting}
        onChange={handleModeChange}
      />
      <p className="text-sm text-gray-700">{mode}</p>
      <Tooltip customClass="py-2" body={modeDesc}>
        <FiInfo className="mr-1" size={12} />
      </Tooltip>
    </label>
  );
};

export default ModeRadioButton;
