import { useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useActionData, useNavigation, useSubmit } from 'react-router-dom';
import { FaLock, FaSpinner } from 'react-icons/fa6';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { useToast } from 'components/public/forms/messages/useToast';
import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from 'lib/schemas/user/resetPasswordSchema';

export default function FormResetPassword() {
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData() as ActionData | null;
  const toast = useToast();
  const lastActionDataRef = useRef<ActionData | null>(null);

  const isSubmitting = navigation.state === 'submitting';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Exibe erro via toast se a action retornar falha
  useEffect(() => {
    if (!actionData) return;
    if (lastActionDataRef.current === actionData) return;

    lastActionDataRef.current = actionData;

    if ('message' in actionData && typeof actionData.message === 'string') {
      toast.error('Erro ao redefinir senha', actionData.message);
    }
  }, [actionData, toast]);

  function onSubmit(values: ResetPasswordFormValues) {
    const formData = new FormData();
    formData.set('password', values.password);
    formData.set('confirmPassword', values.confirmPassword);
    submit(formData, { method: 'post' });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4 font-inter"
    >
      {/* Nova senha */}
      <div className="flex flex-col gap-1">
        <Label
          htmlFor="password"
          className="text-xs font-semibold text-(--text-secondary)"
        >
          Nova senha
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-tertiary) z-10">
            <FaLock size={14} />
          </span>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 10 caracteres"
            error={!!errors.password}
            {...register('password')}
            className="h-12 rounded-xl border-(--primary-color)/20 bg-(--bg-tertiary) pl-9 pr-4"
          />
        </div>
        {errors.password && (
          <p className="text-xs text-(--negative)">{errors.password.message}</p>
        )}
      </div>

      {/* Confirmação de senha */}
      <div className="flex flex-col gap-1">
        <Label
          htmlFor="confirmPassword"
          className="text-xs font-semibold text-(--text-secondary)"
        >
          Confirmar nova senha
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-tertiary) z-10">
            <FaLock size={14} />
          </span>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repita a nova senha"
            error={!!errors.confirmPassword}
            {...register('confirmPassword')}
            className="h-12 rounded-xl border-(--primary-color)/20 bg-(--bg-tertiary) pl-9 pr-4"
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-(--negative)">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Botão de envio */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-(--primary-color) text-sm font-bold text-(--on-primary) shadow-[0_8px_18px_rgba(53,208,195,0.18)] transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <FaSpinner className="animate-spin" size={16} />
        ) : (
          'Redefinir senha'
        )}
      </button>

      {/* Link de volta ao login */}
      <p className="text-center text-xs text-(--text-tertiary)">
        <Link
          to="/login"
          className="font-semibold text-(--primary-color) transition-opacity hover:opacity-80"
        >
          Voltar ao login
        </Link>
      </p>
    </form>
  );
}
