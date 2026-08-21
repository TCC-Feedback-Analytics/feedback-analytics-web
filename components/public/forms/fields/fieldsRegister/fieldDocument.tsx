import { useEffect, useState } from 'react';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { digitsOnly } from 'src/lib/utils/digitsOnly';
import { formatDocumentInput } from 'src/lib/utils/formatDocumentInput';
import type { RegisterFieldDocumentProps } from '../ui.types';

export default function FieldDocument({
  id,
  name,
  label,
  docType,
  register,
  error,
}: RegisterFieldDocumentProps) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    setDisplay('');
  }, [docType]);

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
        inputMode="numeric"
        error={!!error}
        aria-invalid={error ? true : undefined}
        className="font-poppins"
        {...register}
        value={display}
        onChange={(e) => {
          const raw = digitsOnly(e.target.value);
          const formatted = formatDocumentInput(raw, docType);
          setDisplay(formatted);
          register?.onChange?.({ target: { name, value: raw } });
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
