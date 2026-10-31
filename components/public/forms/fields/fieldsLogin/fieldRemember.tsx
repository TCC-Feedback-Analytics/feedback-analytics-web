import { Checkbox } from 'components/ui/checkbox';
import { Label } from 'components/ui/label';
import type { FieldFormProps } from '../ui.types';

export default function FieldRemember({
  id,
  label,
  name,
  register,
}: FieldFormProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={id}
        name={name}
        {...register}
      />
      <Label
        htmlFor={id}
        className="cursor-pointer text-xs font-normal text-(--text-tertiary)"
      >
        {label}
      </Label>
    </div>
  );
}
