import { useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useActionData, useNavigation, useSubmit } from 'react-router-dom';
import { FaEnvelope, FaSpinner } from 'react-icons/fa6';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { useToast } from 'components/public/forms/messages/useToast';
import type { ResendActionData } from './ui.types';
import {
  formatResendCountdown,
  useResendConfirmationCooldown,
} from 'src/hooks/useResendConfirmationCooldown';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from 'lib/schemas/public/forgotPasswordSchema';

const GENERIC_SUCCESS_MESSAGE =
  'Se existir uma conta pendente para este e-mail, enviaremos uma nova confirmação.';

export default function FormResendConfirmation() {
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData() as ResendActionData | undefined;
  const toast = useToast();
  const lastActionDataRef = useRef<ResendActionData | undefined>(undefined);
  const { remainingSeconds, startCooldown } =
    useResendConfirmationCooldown();

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
      startCooldown(actionData.retryAfterSeconds);
      toast.success(
        'Solicitação recebida',
        actionData.message ?? GENERIC_SUCCESS_MESSAGE,
      );
      return;
    }

    if (actionData.message) {
      if (actionData.error === 'rate_limited') {
        startCooldown(actionData.retryAfterSeconds);
      }

      const title =
        actionData.error === 'rate_limited'
          ? 'Muitas tentativas'
          : actionData.error === 'network_error'
            ? 'Falha de conexão'
            : actionData.status !== undefined && actionData.status >= 500
              ? 'Serviço indisponível'
          : 'Não foi possível solicitar o reenvio';
      toast.error(title, actionData.message);
    }
  }, [actionData, startCooldown, toast]);

  function onSubmit(values: ForgotPasswordFormValues) {
    const formData = new FormData();
    formData.set('email', values.email);
    submit(formData, { method: 'post' });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4 font-inter"
    >
      {requestAccepted ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-(--positive)/30 bg-(--positive)/10 p-4 text-center"
        >
          <h2 className="font-poppins text-base font-semibold text-(--text-primary)">
            Solicitação recebida
          </h2>
          <p className="mt-2 font-work-sans text-sm leading-relaxed text-(--text-secondary)">
            {actionData.message ?? GENERIC_SUCCESS_MESSAGE}
          </p>
          {actionData.submittedEmail ? (
            <p className="mt-2 font-work-sans text-xs text-(--text-tertiary)">
              Solicitação registrada para: {actionData.submittedEmail}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        <Label
          htmlFor="email"
          className="text-xs font-semibold text-(--text-secondary)"
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
            className="h-12 rounded-xl border-(--primary-color)/20 bg-(--bg-tertiary) pl-9 pr-4"
          />
        </div>
        {errors.email ? (
          <p id="email-error" className="text-xs text-red-400">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      {remainingSeconds > 0 ? (
        <p
          aria-live="polite"
          className="text-center text-xs text-(--text-tertiary)"
        >
          Você poderá solicitar novamente em{' '}
          {formatResendCountdown(remainingSeconds)}.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || remainingSeconds > 0}
        aria-busy={isSubmitting}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-(--primary-color) font-poppins text-sm font-bold text-(--on-primary) shadow-[0_8px_18px_rgba(53,208,195,0.18)] transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <FaSpinner className="animate-spin" size={16} aria-hidden="true" />
            Solicitando...
          </>
        ) : (
          remainingSeconds > 0
            ? `Solicitar novamente em ${formatResendCountdown(remainingSeconds)}`
            : 'Reenviar confirmação'
        )}
      </button>

      <p className="text-center text-xs text-(--text-tertiary)">
        Já confirmou seu e-mail?{' '}
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
