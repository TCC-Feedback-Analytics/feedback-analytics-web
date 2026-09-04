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
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        name={name}
        {...register}
      />
      <Label
        htmlFor={id}
        className="text-sm font-normal text-(--text-secondary) cursor-pointer"
      >
        {label}
      </Label>
    </div>
  );
}
