import FormCompleteSignup from 'components/public/forms/formCompleteSignup';
import AuthShell from 'components/public/shared/AuthShell';
import { FaUser } from 'react-icons/fa6';
import { useLoaderData } from 'react-router-dom';
import type { LoaderCompleteSignup } from 'src/routes/loaders/loaderCompleteSignup';

export default function CompleteSignup() {
  const { email, fullName } = useLoaderData<typeof LoaderCompleteSignup>();

  return (
    <AuthShell
      wide
      icon={<FaUser className="h-4 w-4" aria-hidden />}
      title="Complete seu cadastro"
      description={email ? `Falta pouco: conectado com o Google como ${email}.` : 'Falta pouco: só mais alguns dados do seu negócio.'}
      eyebrow="ÚLTIMA ETAPA"
    >
      <FormCompleteSignup defaultFullName={fullName} />
    </AuthShell>
  );
}
