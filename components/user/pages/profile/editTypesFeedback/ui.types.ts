import type { IconType } from 'react-icons';

export interface FeedbackTypeOption {
  name: 'uses_company_products' | 'uses_company_services' | 'uses_company_departments';
  savedKey: 'uses_company_products' | 'uses_company_services' | 'uses_company_departments';
  title: string;
  description: string;
  configLink: string;
  icon: IconType;
}
