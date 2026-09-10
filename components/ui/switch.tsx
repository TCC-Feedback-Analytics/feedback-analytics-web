import type { SwitchProps } from './ui.types';

export function Switch({
  checked,
  onCheckedChange,
  'aria-label': ariaLabel,
  disabled = false,
  className = '',
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border p-0.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-color) disabled:cursor-not-allowed disabled:opacity-60 ${
        checked
          ? 'justify-end border-(--primary-color) bg-(--primary-color)'
          : 'justify-start border-(--quaternary-color)/25 bg-(--bg-tertiary)'
      } ${className}`}
    >
      <span className="block h-5 w-5 rounded-full bg-white shadow-sm" aria-hidden="true" />
    </button>
  );
}
