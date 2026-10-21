import { redirect } from 'react-router-dom';
import { ServiceGetUser } from 'src/services/serviceUser';

/**
 * "Complete seu cadastro" (primeira entrada com Google): sem sessão volta ao
 * login; quem já tem telefone já completou e segue para o Dashboard.
 */
export async function LoaderCompleteSignup() {
  let auth;
  try {
    auth = await ServiceGetUser();
  } catch {
    throw redirect('/login');
  }
  if (auth.user.phone) throw redirect('/user/dashboard');
  return {
    email: auth.user.email ?? null,
    fullName: auth.user.user_metadata?.full_name ?? null,
  };
}
