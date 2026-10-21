import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import type { FieldFormProps } from '../ui.types';

export default function FieldText({
  id,
  name,
  label,
  icon,
  register,
  error,
}: FieldFormProps) {
  return (
    <div className="space-y-1 relative">
      <Label
        htmlFor={name}
        className="flex items-center gap-2 pl-1 cursor-pointer text-(--text-secondary) font-work-sans font-normal"
      >
        {icon && <span className="inline-flex items-center text-sm">{icon}</span>}
        <span className="text-sm">{label}</span>
      </Label>
      {/* E-mail do login: "username" deixa o Safari e o Samsung Pass preencherem o par
          e-mail + senha certo; sem maiúscula nem correção automática no celular. */}
      <Input
        type="text"
        id={id}
        name={name}
        autoComplete="username"
        inputMode="email"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        error={!!error}
        aria-invalid={error ? true : undefined}
        className="px-4"
        {...register}
      />
      {error && (
        <span
          role="alert"
          className="absolute right-1 -bottom-5 text-(--negative) text-sm font-semibold"
        >
          {error}
        </span>
      )}
    </div>
  );
}
