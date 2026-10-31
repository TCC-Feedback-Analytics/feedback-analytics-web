import { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type RegisterFormValues,
  registerSchema,
} from 'lib/schemas/public/registerSchema';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useActionData, useNavigation, useSubmit } from 'react-router-dom';
import FieldText from './fields/fieldsRegister/fieldText';
import FieldPhoneRegister from './fields/fieldsRegister/fieldPhone';
import FieldPasswordRegister from './fields/fieldsRegister/fieldPassword';
import FieldTermsRegister from './fields/fieldsRegister/fieldTerms';
import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';
import { FaSpinner } from 'react-icons/fa6';
import { useToast } from 'components/public/forms/messages/useToast';
import RegisterEmailPendingNotice from './messages/registerEmailPendingNotice';
import GoogleSignInButton from './GoogleSignInButton';
import { PASSWORD_TOO_WEAK_MESSAGE } from 'lib/schemas/public/passwordPolicy';
import { getPasswordStrength, loadPasswordScorer, userInputTokens } from 'src/lib/utils/passwordStrength';
import type { RegisterErrorMessage, RegisterIssue } from './ui.types';

const REGISTER_ISSUE_FIELD_PRIORITY = [
  'email',
  'phone',
  'confirmPassword',
  'password',
  'fullName',
  'terms',
] as const;

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function parseRegisterIssues(issues: unknown): RegisterIssue[] {
  if (!Array.isArray(issues)) return [];

  return issues.reduce<RegisterIssue[]>((acc, issue) => {
    if (!issue || typeof issue !== 'object') {
      return acc;
    }

    const maybeIssue = issue as { path?: unknown; message?: unknown };
    const field =
      Array.isArray(maybeIssue.path) && maybeIssue.path.length > 0
        ? String(maybeIssue.path[0])
        : '';
    const message = typeof maybeIssue.message === 'string' ? maybeIssue.message : '';

    if (!field && !message) {
      return acc;
    }

    acc.push({ field, message });
    return acc;
  }, []);
}

function inferRegisterErrorByMessage(rawMessage?: string): RegisterErrorMessage | null {
  if (!rawMessage) return null;

  const normalized = normalizeText(rawMessage);
  const isInvalid = normalized.includes('inval') || normalized.includes('invalid');
  const isAlreadyRegistered =
    normalized.includes('ja cadastrado') ||
    normalized.includes('already registered') ||
    normalized.includes('already exists') ||
    normalized.includes('already taken');

  if (normalized.includes('email') && isAlreadyRegistered) {
    return {
      message: 'E-mail ja cadastrado.',
      description: 'Use outro e-mail ou recupere sua conta existente.',
    };
  }

  if ((normalized.includes('phone') || normalized.includes('telefone')) && isAlreadyRegistered) {
    return {
      message: 'Telefone ja cadastrado.',
      description: 'Informe outro numero para continuar o cadastro.',
    };
  }

  if (normalized.includes('email') && isInvalid) {
    return {
      message: 'E-mail invalido.',
      description: 'Informe um e-mail valido para continuar.',
    };
  }

  if ((normalized.includes('phone') || normalized.includes('telefone')) && isInvalid) {
    return {
      message: 'Telefone invalido.',
      description: 'Use o formato +55DDXXXXXXXXX para continuar.',
    };
  }

  if (
    normalized.includes('senha') &&
    (normalized.includes('nao confer') || normalized.includes('diferente') || normalized.includes('mismatch'))
  ) {
    return {
      message: 'As senhas nao conferem.',
      description: 'Digite a mesma senha nos dois campos para continuar.',
    };
  }

  if (normalized.includes('terms') || normalized.includes('termos')) {
    return {
      message: 'Aceite os termos para continuar.',
      description: 'Marque o aceite dos termos de servico e politica de privacidade.',
    };
  }

  if (
    normalized.includes('password should be at least') ||
    normalized.includes('weak password') ||
    normalized.includes('password is too weak') ||
    normalized.includes('password strength') ||
    (normalized.includes('senha') && normalized.includes('fraca'))
  ) {
    return {
      message: 'Senha fraca.',
      description: PASSWORD_TOO_WEAK_MESSAGE,
    };
  }

  if (
    normalized.includes('signup is disabled') ||
    normalized.includes('signups not allowed') ||
    normalized.includes('cadastros estao temporariamente indisponiveis') ||
    normalized.includes('cadastro temporariamente indisponivel')
  ) {
    return {
      message: 'Cadastro temporariamente indisponivel.',
      description: 'Tente novamente em instantes.',
    };
  }

  if (
    normalized.includes('rate limit') ||
    normalized.includes('too many requests') ||
    normalized.includes('muitas tentativas')
  ) {
    return {
      message: 'Muitas tentativas em pouco tempo.',
      description: 'Aguarde alguns instantes antes de tentar novamente.',
    };
  }

  if (
    normalized.includes('error sending confirmation email') ||
    normalized.includes('error sending confirmation mail') ||
    normalized.includes('nao foi possivel enviar o e-mail de confirmacao')
  ) {
    return {
      message: 'Nao foi possivel enviar o e-mail de confirmacao.',
      description: 'Tente novamente em alguns instantes.',
    };
  }

  if (normalized.includes('captcha') || normalized.includes('validacao de seguranca')) {
    return {
      message: 'Falha na validacao de seguranca.',
      description: 'Recarregue a pagina e tente novamente.',
    };
  }

  if (
    normalized.includes('network error') ||
    normalized.includes('failed to fetch') ||
    normalized.includes('conectar ao servidor') ||
    normalized.includes('conexao')
  ) {
    return {
      message: 'Falha de conexao.',
      description: 'Verifique sua internet e tente novamente.',
    };
  }

  if (
    normalized.includes('servico temporariamente indisponivel') ||
    normalized.includes('service unavailable') ||
    normalized.includes('internal server error')
  ) {
    return {
      message: 'Servico temporariamente indisponivel.',
      description: 'Tente novamente em alguns instantes.',
    };
  }

  return null;
}

function getInvalidPayloadErrorMessage(actionData: ActionData): RegisterErrorMessage {
  const issues = parseRegisterIssues(actionData.issues);

  for (const field of REGISTER_ISSUE_FIELD_PRIORITY) {
    const issue = issues.find((item) => item.field === field);
    if (!issue) continue;

    const issueMessage = issue.message;

    if (field === 'email') {
      return {
        message: 'E-mail invalido.',
        description: issueMessage || 'Informe um e-mail valido para continuar.',
      };
    }

    if (field === 'phone') {
      return {
        message: 'Telefone invalido.',
        description: issueMessage || 'Use o formato +55DDXXXXXXXXX para continuar.',
      };
    }

    if (field === 'confirmPassword') {
      return {
        message: 'As senhas nao conferem.',
        description: issueMessage || 'Digite a mesma senha nos dois campos para continuar.',
      };
    }

    if (field === 'password') {
      return {
        message: 'Senha invalida.',
        description: issueMessage || 'A senha deve ter ao menos 10 caracteres.',
      };
    }

    if (field === 'fullName') {
      return {
        message: 'Nome invalido.',
        description: issueMessage || 'Informe um nome valido para continuar.',
      };
    }

    if (field === 'terms') {
      return {
        message: 'Aceite os termos para continuar.',
        description: issueMessage || 'Marque o aceite dos termos de servico e politica de privacidade.',
      };
    }

  }

  const inferredByMessage = inferRegisterErrorByMessage(actionData.message);
  if (inferredByMessage) {
    return inferredByMessage;
  }

  const issueMessages = Array.from(
    new Set(issues.map((issue) => issue.message).filter(Boolean)),
  );

  if (issueMessages.length > 0) {
    return {
      message: 'Revise os dados do cadastro.',
      description: issueMessages.join(' '),
    };
  }

  return {
    message: 'Dados de cadastro invalidos.',
    description: actionData.message ?? 'Revise os campos e tente novamente.',
  };
}

function getRegisterErrorMessage(actionData: ActionData): RegisterErrorMessage {
  if (actionData.error === 'invalid_payload') {
    return getInvalidPayloadErrorMessage(actionData);
  }

  if (actionData.error === 'network_error') {
    return {
      message: 'Falha de conexao.',
      description: 'Nao foi possivel conectar ao servidor. Verifique sua internet e tente novamente.',
    };
  }

  if (actionData.error === 'rate_limited') {
    return {
      message: 'Muitas tentativas em pouco tempo.',
      description: 'Aguarde alguns instantes antes de tentar novamente.',
    };
  }

  if (actionData.error === 'service_unavailable') {
    return {
      message: 'Cadastro temporariamente indisponivel.',
      description: 'Tente novamente em alguns instantes.',
    };
  }

  if (actionData.error === 'register_failed') {
    return {
      message: 'Nao foi possivel concluir seu cadastro.',
      description: actionData.message ?? 'Revise os dados informados e tente novamente.',
    };
  }

  if (actionData.error === 'email_taken') {
    return {
      message: 'E-mail ja cadastrado.',
      description: 'Use outro e-mail ou recupere sua conta existente.',
    };
  }

  if (actionData.error === 'phone_taken') {
    return {
      message: 'Telefone ja cadastrado.',
      description: 'Informe outro numero para continuar o cadastro.',
    };
  }

  if (actionData.error === 'password_too_weak') {
    return {
      message: 'Senha fraca.',
      description: actionData.message ?? PASSWORD_TOO_WEAK_MESSAGE,
    };
  }

  const inferredByMessage = inferRegisterErrorByMessage(actionData.message);
  if (inferredByMessage) {
    return inferredByMessage;
  }

  if (actionData.error === 'signup_failed') {
    return {
      message: 'Nao foi possivel concluir seu cadastro.',
      description:
        actionData.message ??
        'Verifique os dados informados e tente novamente em instantes.',
    };
  }

  if (actionData.error === 'database_error') {
    return {
      message: 'Erro ao salvar seu cadastro.',
      description:
        actionData.message ??
        'Tente novamente em instantes. Se o problema persistir, entre em contato com o suporte.',
    };
  }

  if (
    actionData.error === 'internal_error' ||
    actionData.error === 'internal_server_error'
  ) {
    return {
      message: 'Falha temporaria ao criar sua conta.',
      description: 'Tente novamente em alguns instantes.',
    };
  }

  return {
    message: 'Nao foi possivel criar sua conta.',
    description: actionData.message ?? 'Tente novamente em instantes.',
  };
}

export default function FormRegister() {
  const submit = useSubmit();
  const navigation = useNavigation();
  const toast = useToast();
  const [submittedEmail, setSubmittedEmail] = useState('');
  const isSubmitting =
    navigation.state === 'submitting' &&
    (navigation.formAction?.includes('/register') ?? false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      terms: false,
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    },
  });

  // Dados que não podem compor a senha: entram no medidor e na checagem do envio.
  const passwordUserInputs = [watch('fullName'), watch('email'), watch('email')?.split('@')[0], watch('phone')];
  const actionData = useActionData() as ActionData | undefined;
  const lastActionDataRef = useRef<ActionData | undefined>(undefined);

  useEffect(() => {
    if (!actionData) return;

    if (actionData.ok) return;

    if (!actionData.error && !actionData.message) return;
    if (lastActionDataRef.current === actionData) return;

    lastActionDataRef.current = actionData;

    const { message, description } = getRegisterErrorMessage(actionData);
    toast.error(message, description);
  }, [actionData, toast]);

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    // O tamanho já passou no schema; a força usa a mesma régua do gateway (zxcvbn).
    try {
      const score = await loadPasswordScorer();
      const check = score(data.password, userInputTokens([data.fullName, data.email, data.email.split('@')[0], data.phone]));
      if (!getPasswordStrength(data.password, check).meetsPolicy) {
        setError('password', { type: 'weak', message: PASSWORD_TOO_WEAK_MESSAGE }, { shouldFocus: true });
        return;
      }
    } catch {
      // Sem o medidor (falha ao carregar), o gateway confere a força.
    }

    setSubmittedEmail(data.email);

    const formData = new FormData();
    formData.set('fullName', data.fullName ?? '');
    formData.set('email', data.email);
    formData.set('phone', data.phone);
    formData.set('password', data.password);
    formData.set('confirmPassword', data.confirmPassword);
    formData.set('terms', data.terms ? 'true' : 'false');

    submit(formData, {
      method: 'post',
      action: '/register',
      encType: 'application/x-www-form-urlencoded',
    });
  };

  if (actionData?.ok) {
    return <RegisterEmailPendingNotice email={submittedEmail} />;
  }

  return (
    <div>
      <div className="mb-5">
        <GoogleSignInButton label="Criar conta com Google" />
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-4 font-inter">
        <FieldText
          id="fullName"
          name="fullName"
          label="Nome do negócio"
          register={register('fullName')}
          error={errors.fullName?.message as string | undefined}
        />
        <FieldText
          id="email"
          name="email"
          type="email"
          label="E-mail"
          register={register('email')}
          error={errors.email?.message as string | undefined}
        />
        <FieldPhoneRegister
          id="phone"
          name="phone"
          label="Contato (Celular DDD +55 fixo)"
          register={register('phone', {
            setValueAs: (v) => {
              const s = typeof v === 'string' ? v : '';
              const digits = s.replace(/\D+/g, '');
              const local = digits.startsWith('55') ? digits.slice(2) : digits;
              const localTrimmed = local.slice(0, 11);
              return `+55${localTrimmed}`;
            },
          })}
          error={errors.phone?.message as string | undefined}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldPasswordRegister
            id="password"
            name="password"
            label="Senha"
            userInputs={passwordUserInputs}
            register={register('password')}
            error={errors.password?.message as string | undefined}
          />
          <FieldPasswordRegister
            id="confirmPassword"
            name="confirmPassword"
            label="Confirmar senha"
            showStrength={false}
            register={register('confirmPassword')}
            error={errors.confirmPassword?.message as string | undefined}
          />
        </div>
        <FieldTermsRegister
          id="terms"
          name="terms"
          register={register('terms')}
          error={errors.terms?.message as string | undefined}
        />
        <button
          type="submit"
          className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-(--primary-color) font-poppins text-sm font-bold text-(--on-primary) shadow-[0_8px_18px_rgba(53,208,195,0.18)] transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-80"
          disabled={isSubmitting}
          aria-busy={isSubmitting}>
          {isSubmitting ? (
            <>
              <FaSpinner className="animate-spin" aria-hidden="true" />
              <span>Criando conta...</span>
            </>
          ) : (
            'Criar Conta'
          )}
        </button>
      </form>
    </div>
  );
}
