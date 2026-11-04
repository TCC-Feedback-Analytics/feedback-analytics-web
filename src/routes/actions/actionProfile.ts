import type { ActionFunctionArgs } from 'react-router-dom';
import {
  ServiceStartPhoneVerification,
  ServiceUpdateEmail,
  ServiceUpdateMetadados,
} from 'src/services/serviceUser';
import {
  INTENT_PROFILE_START_PHONE,
  INTENT_PROFILE_UPDATE_EMAIL,
  INTENT_PROFILE_UPDATE_FULL_NAME,
} from 'src/lib/constants/routes/intents';
import {
  ACTION_ERROR_INVALID_INTENT,
  ACTION_ERROR_INVALID_PAYLOAD,
  ACTION_ERROR_REQUEST_FAILED,
} from 'src/lib/constants/routes/errors';

/**
 * A falha da API volta como resultado da action, e não como exceção: exceção
 * sobe para o errorElement de /user e tira a pessoa do Perfil. A tela mostra o
 * erro num toast.
 */
async function saveProfileChange(save: () => Promise<unknown>) {
  try {
    await save();
    return { ok: true };
  } catch (err) {
    const code = (err as { code?: string }).code;
    return { error: code ?? ACTION_ERROR_REQUEST_FAILED };
  }
}

export async function ActionProfile({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');

  // Atualiza o nome do usuário.
  if (intent === INTENT_PROFILE_UPDATE_FULL_NAME) {
    const full_name = String(form.get('full_name') ?? '');
    if (!full_name) {
      return { error: ACTION_ERROR_INVALID_PAYLOAD };
    }
    return saveProfileChange(() => ServiceUpdateMetadados(full_name));
  }

  // Atualiza o e-mail do usuário.
  if (intent === INTENT_PROFILE_UPDATE_EMAIL) {
    const email = String(form.get('email') ?? '');
    if (!email) {
      return { error: ACTION_ERROR_INVALID_PAYLOAD };
    }
    return saveProfileChange(() => ServiceUpdateEmail(email));
  }

  // Atualiza o telefone do usuário (sem SMS, o gateway salva direto).
  if (intent === INTENT_PROFILE_START_PHONE) {
    const phone = String(form.get('phone') ?? '');
    if (!phone) {
      return { error: ACTION_ERROR_INVALID_PAYLOAD };
    }
    return saveProfileChange(() => ServiceStartPhoneVerification(phone));
  }

  // Retorna um erro caso o intent seja inválido.
  return { error: ACTION_ERROR_INVALID_INTENT };
}
