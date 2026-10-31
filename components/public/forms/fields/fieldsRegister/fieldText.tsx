import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import type { FieldFormProps } from '../ui.types';

export default function FieldText({
  id,
  label,
  name,
  icon,
  type = 'text',
  placeholder,
  error,
  register,
}: FieldFormProps) {
  return (
    <div className="space-y-1">
      <Label
        htmlFor={name}
        className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-(--text-secondary)"
      >
        {icon && <span>{icon}</span>}
        <span>{label}</span>
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        error={!!error}
        aria-invalid={error ? true : undefined}
        autoComplete={type === 'email' ? 'email' : 'off'}
        className="h-12 rounded-xl border-(--primary-color)/20 bg-(--bg-tertiary)"
        {...register}
      />
      {error && (
        <p
          role="alert"
          className="font-work-sans text-right text-(--negative)/80 text-sm font-medium"
        >
          {error}
        </p>
      )}
    </div>
  );
}
