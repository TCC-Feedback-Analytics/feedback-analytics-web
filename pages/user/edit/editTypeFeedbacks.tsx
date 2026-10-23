import { FaBoxesStacked } from 'react-icons/fa6';
import { useEffect } from 'react';
import { useActionData, useNavigation } from 'react-router-dom';
import FormTypesFeedback from 'components/user/pages/profile/editTypesFeedback/formTypesFeedback';
import { useToast } from 'components/public/forms/messages/useToast';
import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';
import PageHeader from 'components/user/shared/PageHeader';

export default function EditTypeFeedbacks() {
  const toast = useToast();
  const navigation = useNavigation();
  const actionData = useActionData() as ActionData | undefined;
  const isSaving =
    navigation.state === 'submitting' &&
    navigation.formAction?.includes('/user/edit/types-feedback');
  useEffect(() => {
    if (!actionData) return;

    if (actionData.ok) {
      toast.success('Configurações salvas!', 'Tipos de feedback atualizados com sucesso.');
    } else {
      toast.error('Erro ao salvar', actionData.message || 'Tente novamente em instantes.');
    }
  }, [actionData, toast]);

  return (
    <div className="font-work-sans space-y-5 pb-8 sm:space-y-6">
      <PageHeader />

      <section className="space-y-5 rounded-3xl border border-(--quaternary-color)/12 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--primary-color)/15 text-(--primary-color)">
            <FaBoxesStacked aria-hidden />
          </span>
          <div>
          <h2 className="font-montserrat text-xl font-semibold text-(--text-primary)">O que você quer acompanhar?</h2>
          <p className="mt-1 text-sm text-(--text-secondary)">Ative um tipo e salve para configurar seus itens.</p>
          </div>
        </div>

        <div className="relative">
          <FormTypesFeedback />

          {isSaving && (
            <div className="pointer-events-none absolute inset-0 rounded-xl border border-(--quaternary-color)/12 bg-(--bg-primary)/35 backdrop-blur-[1px]" />
          )}
        </div>
      </section>
    </div>
  );
}
