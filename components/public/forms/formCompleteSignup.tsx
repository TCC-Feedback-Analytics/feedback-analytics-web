import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from 'lib/schemas/public/registerSchema';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa6';
import z from 'zod';
import FieldText from './fields/fieldsRegister/fieldText';
import FieldPhoneRegister from './fields/fieldsRegister/fieldPhone';
import FieldTermsRegister from './fields/fieldsRegister/fieldTerms';
import { ServiceCompleteSignup } from 'src/services/serviceUser';
import type { FormCompleteSignupProps, FormCompleteSignupValues } from './ui.types';

// Mesmas regras do cadastro por e-mail, sem e-mail e senha (o Google cuida deles).
const completeSignupSchema = z.object({
  fullName: registerSchema.shape.fullName,
  phone: registerSchema.shape.phone,
  terms: registerSchema.shape.terms,
});

const PHONE_TAKEN_MESSAGE = 'Este telefone já está em outra conta.';

export default function FormCompleteSignup({ defaultFullName }: FormCompleteSignupProps) {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormCompleteSignupValues>({
    resolver: zodResolver(completeSignupSchema),
    defaultValues: { fullName: defaultFullName ?? '', phone: '', terms: false },
  });

  const onSubmit: SubmitHandler<FormCompleteSignupValues> = async (values) => {
    setSubmitError(null);
    try {
      await ServiceCompleteSignup({ fullName: values.fullName.trim(), phone: values.phone, terms: true });
      navigate('/user/dashboard', { replace: true });
    } catch (error) {
      if ((error as { code?: string } | null)?.code === 'phone_taken') {
        setError('phone', { message: PHONE_TAKEN_MESSAGE });
        return;
      }
      setSubmitError('Não deu para salvar agora. Tente de novo em instantes.');
    }
  };

  return (
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
      <FieldPhoneRegister
        id="phone"
        name="phone"
        label="Contato (Celular DDD +55 fixo)"
        register={register('phone', {
          setValueAs: (v) => {
            const s = typeof v === 'string' ? v : '';
            const digits = s.replace(/\D+/g, '');
            const local = digits.startsWith('55') ? digits.slice(2) : digits;
            return `+55${local.slice(0, 11)}`;
          },
        })}
        error={errors.phone?.message as string | undefined}
      />
      <FieldTermsRegister
        id="terms"
        name="terms"
        register={register('terms')}
        error={errors.terms?.message as string | undefined}
      />
      {submitError && (
        <p role="alert" className="font-work-sans text-center text-sm text-(--negative)">
          {submitError}
        </p>
      )}
      <button
        type="submit"
        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-(--primary-color) font-poppins text-sm font-bold text-(--on-primary) shadow-[0_8px_18px_rgba(53,208,195,0.18)] transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-80"
        disabled={isSubmitting}
        aria-busy={isSubmitting}>
        {isSubmitting ? (
          <>
            <FaSpinner className="animate-spin" aria-hidden="true" />
            <span>Salvando...</span>
          </>
        ) : (
          'Concluir cadastro'
        )}
      </button>
    </form>
  );
}
