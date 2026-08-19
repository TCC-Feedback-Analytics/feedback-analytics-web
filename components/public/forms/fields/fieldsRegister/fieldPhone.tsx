import { useState } from 'react';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { digitsOnly } from 'src/lib/utils/digitsOnly';
import { formatPhoneInputBR } from 'src/lib/utils/formatPhoneInputBR';
import type { FieldFormProps } from '../ui.types';

export default function FieldPhoneRegister({
  id,
  name,
  label,
  register,
  error,
}: FieldFormProps) {
  const [display, setDisplay] = useState('');

  return (
    <div className="space-y-1 relative">
      <Label
        htmlFor={name}
        className="flex items-center gap-2 pl-2 text-sm text-(--text-secondary) font-work-sans font-normal"
      >
        <span>{label}</span>
      </Label>
      <Input
        id={id}
        name={name}
        inputMode="tel"
        error={!!error}
        aria-invalid={error ? true : undefined}
        className="font-poppins"
        {...register}
        value={display}
        onChange={(e) => {
          const raw = digitsOnly(e.target.value);
          const withCountry = raw.startsWith('55') ? raw : `55${raw}`;
          setDisplay(formatPhoneInputBR(withCountry));
          register?.onChange?.({
            target: { name, value: `+${withCountry}` },
          });
        }}
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
