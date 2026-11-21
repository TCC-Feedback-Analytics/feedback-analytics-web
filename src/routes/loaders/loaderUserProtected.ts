import { redirect, type LoaderFunctionArgs } from 'react-router-dom';
import { loadUserContextData } from 'src/routes/load/loadUserContext';
import { COMPLETE_SIGNUP_PATH } from 'src/lib/utils/googleAuth';
import { ACCOUNT_DELETION_PENDING_PATH } from 'src/lib/utils/accountDeletion';

export async function LoaderUserProtected(_args: LoaderFunctionArgs) {
  void _args;
  let data;
  try {
    data = await loadUserContextData();
  } catch {
    throw redirect('/login');
  }
  // A conta parada só vê o aviso da exclusão, com a opção de desistir.
  if (data.deletionScheduledFor) throw redirect(ACCOUNT_DELETION_PENDING_PATH);
  // Sem telefone = entrou com o Google e ainda não completou o cadastro.
  if (!data.user.phone) throw redirect(COMPLETE_SIGNUP_PATH);
  return data;
}
