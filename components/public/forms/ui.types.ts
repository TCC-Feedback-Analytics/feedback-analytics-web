import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';

export type RegisterIssue = {
  field: string;
  message: string;
};

export type RegisterErrorMessage = {
  message: string;
  description: string;
};

export type ResendActionData = ActionData & {
  status?: number;
  retryAfterSeconds?: number;
  submittedEmail?: string;
};
