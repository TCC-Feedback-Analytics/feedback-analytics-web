import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActionFunctionArgs } from 'react-router-dom';
import { INTENT_FEEDBACK_ANALYZE_RAW, INTENT_FEEDBACK_RUN_IA } from 'src/lib/constants/routes/intents';
import {
  ServiceRunFeedbackIAAnalysis,
  ServiceRunRawFeedbackAnalysis,
} from 'src/services/serviceFeedbacks';
import { ActionFeedbackInsightsReport } from './actionFeedbackInsightsReport';
import { IA_RESPONSE_ERROR_MESSAGES } from 'src/lib/utils/iaErrorMapper';

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

  it.each(Object.entries(IA_RESPONSE_ERROR_MESSAGES))('preserva %s mesmo com HTTP 502', async (code, message) => {
    mockRunRawFeedbackAnalysis.mockRejectedValue(Object.assign(new Error('private provider message'), { status: 502, code }));
    await expect(ActionFeedbackInsightsReport(createArgs())).resolves.toEqual({ errorCode: code, error: message });
    expect(mockRunFeedbackIaAnalysis).not.toHaveBeenCalled();
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

  it('propaga force para permitir refazer um relatório atualizado', async () => {
    mockRunFeedbackIaAnalysis.mockResolvedValue({ jobId: 'job-1', status: 'queued' });
    const form = new URLSearchParams({
      intent: INTENT_FEEDBACK_RUN_IA, scope_type: 'COMPANY', analyze_pending: 'true', force: 'true',
    });
    const args = createArgs();
    args.request = new Request('http://localhost/user/insights/reports', {
      method: 'POST', body: form,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    });
    await expect(ActionFeedbackInsightsReport(args)).resolves.toMatchObject({ ok: true, jobId: 'job-1' });
    expect(mockRunFeedbackIaAnalysis).toHaveBeenCalledWith(expect.objectContaining({
      analyze_pending: true, force: true,
    }));
  });
});
