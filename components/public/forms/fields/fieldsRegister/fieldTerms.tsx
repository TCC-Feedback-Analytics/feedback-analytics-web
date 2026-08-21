import { Checkbox } from 'components/ui/checkbox';
import { Label } from 'components/ui/label';
import type { FieldFormProps } from '../ui.types';

export default function FieldTermsRegister({
  id,
  name,
  label,
  register,
  error,
}: FieldFormProps) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox
        id={id}
        name={name}
        {...register}
      />
      <Label
        htmlFor={id}
        className="text-sm font-normal text-(--text-secondary) cursor-pointer font-work-sans"
      >
        {label}
      </Label>
      {error && (
        <span
          role="alert"
          className="font-work-sans text-(--negative)/70 text-sm font-medium"
        >
          {error}
        </span>
      )}
    </div>
  );
}
