export const TEST_USER = {
  email: process.env.E2E_TEST_EMAIL ?? '',
  password: process.env.E2E_TEST_PASSWORD ?? '',
};

export const TEST_ENTERPRISE_ID = process.env.E2E_TEST_ENTERPRISE_ID ?? '';

export function requireE2EEnvironment(): void {
  const requiredVariables = [
    'E2E_TEST_EMAIL',
    'E2E_TEST_PASSWORD',
    'E2E_TEST_ENTERPRISE_ID',
  ] as const;
  const missingVariables = requiredVariables.filter(
    (name) => !process.env[name]?.trim(),
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `O E2E exige as seguintes variáveis de ambiente: ${missingVariables.join(', ')}.`,
    );
  }
}

export const VALID_CPF = '529.982.247-25';
export const INVALID_CPF = '111.111.111-11';
export const VALID_CNPJ = '11.222.333/0001-81';

export function uniqueEmail(prefix = 'e2e') {
  return `${prefix}+${Date.now()}@teste.com`;
}

export const QR_FEEDBACK = {
  rating: 5,
  message: 'Ótimo atendimento, equipe muito prestativa e produto excelente.',
};

export const WEAK_PASSWORD = '123';
export const VALID_PASSWORD = 'Teste@123456';
export const MISMATCHED_PASSWORD = 'Outra@Senha123';

export function generateRandomCpf(): string {
  const base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
  let sum1 = 0;
  for (let i = 0; i < 9; i++) {
    sum1 += Number(base[i]) * (10 - i);
  }
  const rem1 = sum1 % 11;
  const d1 = rem1 < 2 ? 0 : 11 - rem1;

  let sum2 = 0;
  for (let i = 0; i < 9; i++) {
    sum2 += Number(base[i]) * (11 - i);
  }
  sum2 += d1 * 2;
  const rem2 = sum2 % 11;
  const d2 = rem2 < 2 ? 0 : 11 - rem2;

  return `${base}${d1}${d2}`;
}

export function generateRandomPhone(): string {
  const number = Math.floor(10000000 + Math.random() * 90000000);
  return `119${number}`;
}
