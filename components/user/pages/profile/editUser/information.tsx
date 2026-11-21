
import { nameSchema } from 'lib/schemas/user/nameSchema';
import { emailUpdateSchema } from 'lib/schemas/user/emailUpdateSchema';
import { INTENT_PROFILE_UPDATE_FULL_NAME, INTENT_PROFILE_UPDATE_EMAIL } from 'src/lib/constants/routes/intents';
import { FaEnvelope, FaStore } from 'react-icons/fa6';
import EditableFieldFixed from './EditableFieldFixed';
import PhoneEditableField from './PhoneEditableField';
import type { InformationProps } from './ui.types';

export default function Information({
  defaultFullName = '',
  defaultEmail = '',
  defaultPhone = '',
}: InformationProps) {
  // Garantir que os valores nunca sejam undefined
  const safeName = defaultFullName || '';
  const safeEmail = defaultEmail || '';
  const safePhone = defaultPhone || '';

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <EditableFieldFixed
          label="Nome do negócio"
          value={safeName}
          placeholder="Digite o nome do negócio"
          type="text"
          icon={<FaStore aria-hidden="true" className="text-(--primary-color)" />}
          schema={nameSchema}
          intent={INTENT_PROFILE_UPDATE_FULL_NAME}
          hint="O nome que identifica o seu negócio na plataforma"
          successMessage="Nome atualizado!"
          errorMessage="Erro ao atualizar nome"
          className="md:col-span-1"
        />

        <EditableFieldFixed
          label="Email"
          value={safeEmail}
          placeholder="seu@email.com"
          type="email"
          icon={<FaEnvelope aria-hidden="true" className="text-(--primary-color)" />}
          schema={emailUpdateSchema}
          intent={INTENT_PROFILE_UPDATE_EMAIL}
          hint="Primeiro aprove no e-mail atual, depois confirme no novo"
          successMessage="Aprove a troca no seu e-mail atual!"
          errorMessage="Erro ao atualizar email"
          className="md:col-span-1"
        />
      </div>

      <PhoneEditableField
        currentPhone={safePhone}
        className="w-full"
      />
    </div>
  );
}
