import { Checkbox } from 'components/ui/checkbox';
import { Label } from 'components/ui/label';
import { PRIVACY_PATH, TERMS_PATH } from 'src/lib/constants/legal';
import type { FieldFormProps } from '../ui.types';

const LEGAL_LINK_CLASS = 'font-medium text-(--secondary-color) underline-offset-2 hover:underline';

export default function FieldTermsRegister({
  id,
  name,
  register,
  error,
}: FieldFormProps) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox
        id={id}
        name={name}
        {...register}
      />
      <Label
        htmlFor={id}
        className="text-sm font-normal text-(--text-secondary) cursor-pointer font-work-sans"
      >
        Concordo com os{' '}
        <a href={TERMS_PATH} target="_blank" rel="noopener noreferrer" className={LEGAL_LINK_CLASS}>
          Termos de Serviço
        </a>{' '}
        e a{' '}
        <a href={PRIVACY_PATH} target="_blank" rel="noopener noreferrer" className={LEGAL_LINK_CLASS}>
          Política de Privacidade
        </a>
      </Label>
      {error && (
        <span
          role="alert"
          className="font-work-sans text-(--negative)/70 text-sm font-medium"
        >
          {error}
        </span>
      )}
    </div>
  );
}
