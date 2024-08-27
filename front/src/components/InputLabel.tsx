import { ReactNode } from 'react';

export function InputLabel(props: { label: ReactNode }) {
  return <p className="text-sm text-gray-700 mb-2">{props.label}</p>;
}
