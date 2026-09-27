import { type ActionFunctionArgs } from 'react-router-dom';
import { ServiceResendConfirmation } from 'src/services/serviceAuth';

export async function ActionResendConfirmation({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = String(formData.get('email') ?? '');

  if (!email) {
    return {
      ok: false,
      error: 'invalid_payload',
      message: 'Informe um e-mail válido.',
    };
  }

  return ServiceResendConfirmation(email);
}
