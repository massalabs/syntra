import React from 'react';

type CheckBoxProps = {
  isSelected: boolean;
  onChange: (id: bigint, checked: boolean) => void;
  id: bigint;
};

const CheckBox: React.FC<CheckBoxProps> = ({
  onChange,
  id,
  isSelected,
}: CheckBoxProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor="Option1" className="flex items-start gap-4">
        <div className="flex items-center">
          <input
            checked={isSelected}
            onChange={(val) => onChange(id, val.target.checked)}
            type="checkbox"
            className="cursor-pointer size-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
        </div>
      </label>
    </div>
  );
};

export default CheckBox;
