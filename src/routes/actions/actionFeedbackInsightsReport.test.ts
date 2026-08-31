import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActionFunctionArgs } from 'react-router-dom';
import { INTENT_FEEDBACK_ANALYZE_RAW } from 'src/lib/constants/routes/intents';
import {
  ServiceRunFeedbackIAAnalysis,
  ServiceRunRawFeedbackAnalysis,
} from 'src/services/serviceFeedbacks';
import { ActionFeedbackInsightsReport } from './actionFeedbackInsightsReport';

vi.mock('src/services/serviceFeedbacks', () => ({
  ServiceRunFeedbackIAAnalysis: vi.fn(),
  ServiceRunRawFeedbackAnalysis: vi.fn(),
}));

const mockRunRawFeedbackAnalysis = vi.mocked(ServiceRunRawFeedbackAnalysis);
const mockRunFeedbackIaAnalysis = vi.mocked(ServiceRunFeedbackIAAnalysis);

function createArgs(): ActionFunctionArgs {
  const form = new URLSearchParams({
    intent: INTENT_FEEDBACK_ANALYZE_RAW,
    scope_type: 'COMPANY',
  });

  return {
    request: new Request('http://localhost/user/insights/reports', {
      method: 'POST',
      body: form,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    }),
    params: {},
    context: undefined,
  } as unknown as ActionFunctionArgs;
}

describe('[Integração] ActionFeedbackInsightsReport', () => {
  beforeEach(() => {
    mockRunRawFeedbackAnalysis.mockReset();
    mockRunFeedbackIaAnalysis.mockReset();
  });

  it('orienta a configurar OpenRouter quando o Gateway exige a chave da empresa', async () => {
    mockRunRawFeedbackAnalysis.mockRejectedValue(
      Object.assign(new Error('ia_config_required'), {
        status: 400,
        code: 'ia_config_required',
      }),
    );

    await expect(ActionFeedbackInsightsReport(createArgs())).resolves.toEqual({
      errorCode: 'ia_config_required',
      error:
        'Configure sua chave OpenRouter em Editar > Configuração de IA antes de iniciar uma análise.',
    });
  });
});
