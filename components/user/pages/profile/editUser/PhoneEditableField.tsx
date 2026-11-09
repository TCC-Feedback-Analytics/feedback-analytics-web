import { useState, useEffect, useEffectEvent, useRef } from 'react';
import { useSubmit, useActionData } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { phoneStartSchema } from 'lib/schemas/user/phoneSchema';
import { INTENT_PROFILE_START_PHONE } from 'src/lib/constants/routes/intents';
import { useToast } from 'components/public/forms/messages/useToast';
import { FaCircleCheck, FaCircleExclamation, FaPenToSquare, FaPhone, FaXmark } from 'react-icons/fa6';
import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';
import type { PhoneEditableFieldProps } from './ui.types';

/**
 * Sem provedor de SMS, o gateway salva o número direto em /phone/start; por isso
 * não há passo de código de confirmação.
 */
export default function PhoneEditableField({ currentPhone, className = '' }: PhoneEditableFieldProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [isSaving, setIsSaving] = useState(false);
  // Resposta que já existia ao salvar: só uma resposta nova encerra o envio.
  const pendingSubmitRef = useRef<{ actionDataAtSubmit: ActionData | undefined } | null>(null);

  // Garantir que currentPhone nunca seja undefined
  const safeCurrentPhone = currentPhone || '';

  const submit = useSubmit();
  const toast = useToast();
  const actionData = useActionData() as ActionData | undefined;

  const phoneForm = useForm({
    resolver: zodResolver(phoneStartSchema),
    defaultValues: { phone: safeCurrentPhone },
  });

  // A resposta da action chega pela navegação, um sistema externo ao componente.
  const handleSaveResult = useEffectEvent((data: ActionData) => {
    if (data.ok) {
      toast.success('Telefone atualizado!', 'Alterações salvas com sucesso');
      setMode('view');
    } else {
      toast.error('Erro ao atualizar telefone', data.message || 'Tente novamente');
    }
    setIsSaving(false);
  });

  useEffect(() => {
    const pending = pendingSubmitRef.current;
    if (!pending || !actionData || actionData === pending.actionDataAtSubmit) return;
    pendingSubmitRef.current = null;
    handleSaveResult(actionData);
  }, [actionData]);

  const handleEdit = () => {
    setMode('edit');
  };

  const handleCancel = () => {
    phoneForm.reset({ phone: safeCurrentPhone });
    setIsSaving(false);
    pendingSubmitRef.current = null;
    setMode('view');
  };

  const handlePhoneSubmit = (data: { phone: string }) => {
    pendingSubmitRef.current = { actionDataAtSubmit: actionData };
    setIsSaving(true);
    const fd = new FormData();
    fd.set('intent', INTENT_PROFILE_START_PHONE);
    fd.set('initial_phone', safeCurrentPhone);
    fd.set('phone', data.phone);
    submit(fd, { method: 'post', encType: 'application/x-www-form-urlencoded' });
  };

  // Modo de visualização
  if (mode === 'view') {
    return (
      <button
        type="button"
        aria-label="Editar telefone"
        className={`group relative w-full rounded-lg border border-(--quaternary-color)/20 bg-(--bg-secondary)/30 p-4 text-left transition-all hover:border-(--primary-color)/30 hover:bg-(--primary-color)/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-color) ${className}`}
        onClick={handleEdit}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-(--text-secondary)">Telefone</span>
              <span className="text-lg opacity-70 transition-transform group-hover:scale-110">
                <FaPhone aria-hidden="true" className="text-(--primary-color)" />
              </span>
            </div>
            <p className="text-(--text-primary) font-medium mb-1">
              {safeCurrentPhone || 'Não informado'}
            </p>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-(--primary-color)/12 px-2.5 py-1.5 text-xs font-semibold text-(--primary-color) transition group-hover:bg-(--primary-color) group-hover:text-(--on-primary)">
              <FaPenToSquare aria-hidden="true" />
              <span>Editar</span>
          </span>
        </div>
      </button>
    );
  }

  // Modo de edição (alterar número)
  return (
    <div className={`bg-(--bg-secondary) border-2 border-(--primary-color) rounded-lg p-4 shadow-lg transition-all ${className}`}>
      <form onSubmit={(event) => phoneForm.handleSubmit(handlePhoneSubmit)(event)} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-(--text-primary) mb-2">
            Novo número de telefone
          </label>
          <input
            type="tel"
            {...phoneForm.register('phone')}
            placeholder="+55 (11) 99999-9999"
            disabled={isSaving}
            className="w-full rounded-lg border border-(--quaternary-color)/30 bg-(--seventh-color) px-4 py-3 text-(--text-primary) outline-none placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 transition-all"
            autoFocus
          />
          {phoneForm.formState.errors.phone?.message && (
            <p className="mt-1 text-xs text-(--negative) flex items-center gap-1">
              <FaCircleExclamation aria-hidden="true" />
              {phoneForm.formState.errors.phone.message}
            </p>
          )}
          <p className="mt-1 text-xs text-(--text-secondary)">
            Formato: +55 seguido do DDD e número
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-(--primary-color) text-(--on-primary) rounded-lg text-sm font-medium hover:shadow-md transition-all flex items-center gap-2"
          >
            <FaCircleCheck aria-hidden="true" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="px-4 py-2 bg-(--quaternary-color)/20 text-(--text-secondary) rounded-lg text-sm font-medium hover:bg-(--quaternary-color)/30 transition-all flex items-center gap-2"
          >
            <FaXmark aria-hidden="true" />
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
