import { redirect, type LoaderFunctionArgs } from 'react-router-dom';
import { loadUserContextData } from 'src/routes/load/loadUserContext';
import { COMPLETE_SIGNUP_PATH } from 'src/lib/utils/googleAuth';

export async function LoaderUserProtected(_args: LoaderFunctionArgs) {
  void _args;
  let data;
  try {
    data = await loadUserContextData();
  } catch {
    throw redirect('/login');
  }
  // Sem telefone = entrou com o Google e ainda não completou o cadastro.
  if (!data.user.phone) throw redirect(COMPLETE_SIGNUP_PATH);
  return data;
}
