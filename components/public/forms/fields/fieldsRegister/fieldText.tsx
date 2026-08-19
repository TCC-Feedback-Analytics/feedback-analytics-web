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
    <div className="space-y-1 relative">
      <Label
        htmlFor={name}
        className="flex items-center gap-2 pl-2 text-sm text-(--text-secondary) font-work-sans font-normal"
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
        {...register}
      />
      {error && (
        <span
          role="alert"
          className="font-work-sans absolute -right-1 -bottom-5 text-(--negative)/70 text-sm font-medium"
        >
          {error}
        </span>
      )}
    </div>
  );
}
