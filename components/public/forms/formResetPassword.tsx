import { useEffect } from 'react';
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
      className="flex flex-col gap-4"
    >
      {/* Nova senha */}
      <div className="flex flex-col gap-1">
        <Label
          htmlFor="password"
          className="text-sm font-medium text-(--text-secondary)"
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
            placeholder="Mínimo 6 caracteres"
            error={!!errors.password}
            {...register('password')}
            className="pl-9 pr-4"
          />
        </div>
        {errors.password && (
          <p className="text-xs text-red-400">{errors.password.message}</p>
        )}
      </div>

      {/* Confirmação de senha */}
      <div className="flex flex-col gap-1">
        <Label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-(--text-secondary)"
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
            className="pl-9 pr-4"
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Botão de envio */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-(--primary-color) to-(--tertiary-color) font-medium text-white transition-opacity hover:opacity-90 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
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
          className="text-(--secondary-color) font-medium transition-opacity hover:opacity-80"
        >
          Voltar ao login
        </Link>
      </p>
    </form>
  );
}
