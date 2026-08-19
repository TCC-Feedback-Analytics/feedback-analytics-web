import { Label } from 'components/ui/label';
import { SelectNative } from 'components/ui/select';
import type { CustomerData } from 'lib/interfaces/contracts/qrcode/feedback.contract';
import type { FieldCustomerGenderProps } from './ui.types';

export default function FieldCustomerGender({ gender, onGenderChange }: FieldCustomerGenderProps) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor="customer_gender"
        className="font-work-sans text-sm font-medium text-(--text-primary)"
      >
        Gênero
      </Label>
      <SelectNative
        id="customer_gender"
        value={gender || ''}
        onChange={(e) => onGenderChange(e.target.value as CustomerData['customer_gender'])}
      >
        <option value="">Selecione...</option>
        <option value="masculino">Masculino</option>
        <option value="feminino">Feminino</option>
        <option value="outro">Outro</option>
        <option value="prefiro_nao_informar">
          Prefiro não informar
        </option>
      </SelectNative>
    </div>
  );
}
