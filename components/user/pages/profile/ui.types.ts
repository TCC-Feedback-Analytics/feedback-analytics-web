import type { ReactNode } from 'react';
import type { EnterpriseContext } from 'lib/interfaces/entities/enterprise.entity';

export type CompanyProfileSectionProps = {
  enterprise: EnterpriseContext;
  children: ReactNode;
};
