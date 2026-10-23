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
    <div className="space-y-1">
      <Label
        htmlFor={name}
        className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-(--text-secondary)"
      >
        <span>{label}</span>
      </Label>
      <Input
        id={id}
        name={name}
        inputMode="tel"
        error={!!error}
        aria-invalid={error ? true : undefined}
        className="h-12 rounded-xl border-(--primary-color)/20 bg-(--bg-tertiary) font-poppins"
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
