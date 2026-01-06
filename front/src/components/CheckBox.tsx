import React from 'react';
import { FiCheck } from 'react-icons/fi';

type CheckBoxProps = {
  isSelected: boolean;
  onChange: (checked: boolean) => void;
  id: bigint;
};

const CheckBox: React.FC<CheckBoxProps> = ({
  onChange,
  isSelected,
}: CheckBoxProps) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer group">
      <input
        checked={isSelected}
        onChange={(val) => onChange(val.target.checked)}
        type="checkbox"
        className="sr-only peer"
      />
      <div 
        className={`
          w-5 h-5 rounded-md
          border-2 
          flex items-center justify-center
          transition-all duration-200
          ${isSelected 
            ? 'bg-primary border-primary' 
            : 'bg-white border-gray-300 group-hover:border-primary/50'
          }
        `}
      >
        {isSelected && (
          <FiCheck size={14} className="text-white" strokeWidth={3} />
        )}
      </div>
    </label>
  );
};

export default CheckBox;
