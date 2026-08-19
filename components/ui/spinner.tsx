import * as React from 'react';
import { FaSpinner } from 'react-icons/fa6';

export interface SpinnerProps extends React.SVGAttributes<SVGElement> {
  size?: number;
}

export function Spinner({ className = '', size = 16, ...props }: SpinnerProps) {
  return (
    <FaSpinner
      size={size}
      className={`animate-spin text-(--primary-color) ${className}`}
      {...props}
    />
  );
}
