import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ServiceGetCompanyQuestionSuggestions,
  ServiceRequestCompanyQuestionSuggestions,
  validateCompanyQuestionSuggestions,
} from './serviceCompanyQuestionSuggestions';

describe('serviceCompanyQuestionSuggestions', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('valida e ordena exatamente três perguntas pelo campo técnico', () => {
    const result = validateCompanyQuestionSuggestions(
      {
        contextHash: 'hash-1',
        questions: [
          { question_order: 3, question_text: 'Como você avalia o conforto durante o atendimento?' },
          { question_order: 1, question_text: 'Como você avalia a clareza das orientações recebidas?' },
          { question_order: 2, question_text: 'Como você avalia a qualidade do serviço realizado?' },
        ],
      },
      'hash-1',
    );

    expect(result?.map((question) => question.question_order)).toEqual([1, 2, 3]);
  });

  it('recusa resultado parcial ou de outra fotografia do contexto', () => {
    expect(
      validateCompanyQuestionSuggestions(
        {
          contextHash: 'hash-2',
          questions: [
            { question_order: 1, question_text: 'Como você avalia a clareza das orientações recebidas?' },
          ],
        },
        'hash-1',
      ),
    ).toBeNull();
  });

  it('envia somente o corpo vazio ao enfileirar e preserva retryAfterSeconds', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'rate_limited', retryAfterSeconds: 240 }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '240' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(ServiceRequestCompanyQuestionSuggestions()).rejects.toMatchObject({
      status: 429,
      code: 'rate_limited',
      retryAfterSeconds: 240,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/protected/user/company-feedback-questions/suggestions',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: '{}',
      }),
    );
  });

  it('consulta o mesmo job e codifica o identificador na URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        id: 'job/a',
        jobType: 'generate_company_questions',
        status: 'queued',
        total: 1,
        done: 0,
        errorCode: null,
        updatedAt: null,
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(ServiceGetCompanyQuestionSuggestions('job/a')).resolves.toMatchObject({ id: 'job/a' });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/protected/user/company-feedback-questions/suggestions/job%2Fa',
      expect.objectContaining({ method: 'GET', credentials: 'include' }),
    );
  });
});
