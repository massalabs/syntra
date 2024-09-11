import React from 'react';

type CheckBoxProps = {
  isSelected: boolean;
  onSelect: (id: bigint) => void;
  id: bigint;
};

const CheckBox: React.FC<CheckBoxProps> = ({
  onSelect,
  id,
  isSelected,
}: CheckBoxProps) => {
  return (
    <div>
      <legend className="sr-only">Checkboxes</legend>
      <div className="space-y-2 ">
        <label htmlFor="Option1" className="flex items-start gap-4">
          <div className="flex items-center">
            <input
              checked={isSelected}
              onChange={() => onSelect(id)}
              type="checkbox"
              className="cursor-pointer size-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </div>
        </label>
      </div>
    </div>
  );
};

export default CheckBox;
