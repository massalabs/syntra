import { ReactNode } from 'react';

export function InputLabel(props: { label: ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">
      {props.label}
      {props.required && <span className="text-primary ml-0.5">*</span>}
    </label>
  );
}
