import { memo, type ChangeEvent } from 'react';
import { Checkbox } from 'components/ui/checkbox';
import type { FieldUsesCompanyProductsProps } from './ui.types';

const CheckboxItem = memo(function CheckboxItem({
  name,
  checked,
  title,
  description,
  onChange,
}: {
  name: string;
  checked: boolean;
  title: string;
  description: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3.5">
      <div className="mt-0.5">
        <Checkbox
          name={name}
          checked={checked}
          onChange={onChange}
        />
      </div>
      <div className="flex-1">
        <span className="block text-sm font-medium text-(--text-primary)">{title}</span>
        <p className="mt-1 text-xs leading-relaxed text-(--text-tertiary)">{description}</p>
      </div>
    </label>
  );
});

const FieldUsesCompanyProducts = memo(function FieldUsesCompanyProducts({
  usesCompanyProducts,
  usesCompanyServices,
  usesCompanyDepartments,
  onChange,
}: FieldUsesCompanyProductsProps) {
  return (
    <div className="font-work-sans space-y-4 rounded-xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-5 transition-all duration-200 hover:border-(--quaternary-color)/18">
      <div>
        <h3 className="text-sm font-semibold text-(--text-primary)">Escopo da operação</h3>
        <p className="mt-1 text-xs leading-relaxed text-(--text-tertiary)">
          Marque os tipos utilizados na sua operação para habilitar os QR Codes específicos.
          Para que cada tipo apareça na análise de insights, cadastre ao menos um item no catálogo em{' '}
          <span className="font-medium text-(--text-secondary)">Configuração de Feedbacks</span>.
        </p>
      </div>

      <CheckboxItem
        name="uses_company_products"
        checked={usesCompanyProducts}
        onChange={onChange}
        title="A empresa possui produtos"
        description="Habilita o QR Code de produtos. Cadastre ao menos um produto em Configuração de Feedbacks para análise de insights."
      />

      <CheckboxItem
        name="uses_company_services"
        checked={usesCompanyServices}
        onChange={onChange}
        title="A empresa possui serviços"
        description="Habilita o QR Code de serviços. Cadastre ao menos um serviço em Configuração de Feedbacks para análise de insights."
      />

      <CheckboxItem
        name="uses_company_departments"
        checked={usesCompanyDepartments}
        onChange={onChange}
        title="A empresa possui áreas/departamentos"
        description="Habilita o QR Code de áreas/departamentos. Cadastre ao menos um departamento em Configuração de Feedbacks para análise de insights."
      />
    </div>
  );
});

export default FieldUsesCompanyProducts;
