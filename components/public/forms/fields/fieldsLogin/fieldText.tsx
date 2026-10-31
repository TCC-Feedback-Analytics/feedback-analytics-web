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
    <div className="space-y-1">
      <Label
        htmlFor={name}
        className="cursor-pointer text-xs font-semibold text-(--text-secondary)"
      >
        {label}
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
        placeholder="voce@empresa.com"
        startIcon={icon}
        error={!!error}
        aria-invalid={error ? true : undefined}
        className="h-12 rounded-xl border-(--primary-color)/20 bg-(--bg-tertiary)"
        {...register}
      />
      {error && (
        <p
          role="alert"
          className="text-right text-(--negative) text-sm font-semibold"
        >
          {error}
        </p>
      )}
    </div>
  );
}
