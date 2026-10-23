import type {
  FormQRCodeFeedbackProps,
  PublicQrFeedbackFormViewModel,
} from 'components/public/forms/fields/fieldsQRCode/ui.types';
import type {
  PublicQrFeedbackScope,
  PublicQrFeedbackTemplateKey,
} from 'src/lib/utils/publicQrFeedbackTemplateEngine';
import type { ReactNode } from 'react';

export type PublicQrFeedbackTemplateRendererProps = {
  scope: PublicQrFeedbackScope;
  model: PublicQrFeedbackFormViewModel;
};

export type FeedbackTemplateComponent = (
  props: FormQRCodeFeedbackProps,
) => React.JSX.Element;

export type FeedbackTemplateRegistry = Record<
  PublicQrFeedbackTemplateKey,
  FeedbackTemplateComponent
>;

export type FeedbackStatusTone = 'success' | 'notice' | 'error';

export interface FeedbackStatusLayoutProps {
  tone: FeedbackStatusTone;
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}
