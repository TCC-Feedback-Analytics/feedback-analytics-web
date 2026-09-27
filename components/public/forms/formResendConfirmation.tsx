import { useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useActionData, useNavigation, useSubmit } from 'react-router-dom';
import { FaEnvelope, FaSpinner } from 'react-icons/fa6';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { useToast } from 'components/public/forms/messages/useToast';
import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from 'lib/schemas/public/forgotPasswordSchema';

const GENERIC_SUCCESS_MESSAGE =
  'Se existir uma conta pendente para este e-mail, enviaremos uma nova confirmação.';

export default function FormResendConfirmation() {
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData() as ActionData | undefined;
  const toast = useToast();
  const lastActionDataRef = useRef<ActionData | undefined>(undefined);

  const isSubmitting = navigation.state === 'submitting';
  const requestAccepted = actionData?.ok === true;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  useEffect(() => {
    if (!actionData || lastActionDataRef.current === actionData) return;

    lastActionDataRef.current = actionData;

    if (actionData.ok === true) {
      toast.success(
        'Solicitação recebida',
        actionData.message ?? GENERIC_SUCCESS_MESSAGE,
      );
      return;
    }

    if (actionData.message) {
      const title =
        actionData.error === 'rate_limited'
          ? 'Muitas tentativas'
          : 'Não foi possível solicitar o reenvio';
      toast.error(title, actionData.message);
    }
  }, [actionData, toast]);

  function onSubmit(values: ForgotPasswordFormValues) {
    const formData = new FormData();
    formData.set('email', values.email);
    submit(formData, { method: 'post' });
  }

  if (requestAccepted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col gap-4 text-center"
      >
        <div className="rounded-lg border border-(--positive)/30 bg-(--positive)/10 p-4">
          <h2 className="font-poppins text-base font-semibold text-(--text-primary)">
            Solicitação recebida
          </h2>
          <p className="mt-2 font-work-sans text-sm leading-relaxed text-(--text-secondary)">
            {actionData.message ?? GENERIC_SUCCESS_MESSAGE}
          </p>
          <p className="mt-2 font-work-sans text-xs text-(--text-tertiary)">
            Verifique também a caixa de spam ou promoções.
          </p>
        </div>

        <Link
          to="/login"
          className="flex h-11 w-full items-center justify-center rounded-lg bg-gradient-to-r from-(--primary-color) to-(--tertiary-color) font-poppins font-medium text-white transition-opacity hover:opacity-90 active:translate-y-px"
        >
          Voltar ao login
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <Label
          htmlFor="email"
          className="text-sm font-medium text-(--text-secondary)"
        >
          E-mail
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-(--text-tertiary)">
            <FaEnvelope size={14} aria-hidden="true" />
          </span>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            error={!!errors.email}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
            className="pl-9 pr-4"
          />
        </div>
        {errors.email ? (
          <p id="email-error" className="text-xs text-red-400">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-(--primary-color) to-(--tertiary-color) font-poppins font-medium text-white transition-opacity hover:opacity-90 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <FaSpinner className="animate-spin" size={16} aria-hidden="true" />
            Solicitando...
          </>
        ) : (
          'Reenviar confirmação'
        )}
      </button>

      <p className="text-center text-xs text-(--text-tertiary)">
        Já confirmou seu e-mail?{' '}
        <Link
          to="/login"
          className="font-medium text-(--secondary-color) transition-opacity hover:opacity-80"
        >
          Voltar ao login
        </Link>
      </p>
    </form>
  );
}
