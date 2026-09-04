import { FaSpinner } from 'react-icons/fa6';
import type { SpinnerProps } from './ui.types';

export function Spinner({ className = '', size = 16, ...props }: SpinnerProps) {
  return (
    <FaSpinner
      size={size}
      className={`animate-spin text-(--primary-color) ${className}`}
      {...props}
    />
  );
}
