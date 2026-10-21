/**
 * Força da senha com o zxcvbn (dicionário comum + português), a mesma régua do
 * gateway: reconhece palavras, nomes, datas, sequências e repetições. Contar só
 * os tipos de caractere deixava "Palavra123palavra" como "Muito forte".
 * O zxcvbn e os dicionários carregam sob demanda, só quando alguém digita uma senha.
 */
import {
  MIN_PASSWORD_LENGTH,
  MIN_PASSWORD_SCORE,
} from 'lib/schemas/public/passwordPolicy';

export type PasswordStrength = {
  percent: number;
  label: string;
  color: string;
  showBar: boolean;
  /** A senha segue a regra (tamanho e força) e o cadastro pode seguir. */
  meetsPolicy: boolean;
  /** Dica do zxcvbn em português, quando a senha ainda não é forte. */
  hint: string | null;
};

export type PasswordCheck = { score: number; warning: string | null; suggestion: string | null };
export type PasswordScorer = (password: string, userInputs?: string[]) => PasswordCheck;

const LABELS = ['Muito fraca', 'Fraca', 'Razoável', 'Quase lá', 'Forte'] as const;
const COLORS = ['bg-red-500', 'bg-red-500', 'bg-yellow-500', 'bg-yellow-500', 'bg-green-500'] as const;

/** Dados da pessoa em pedaços ("Bom Pão" → bom, pao, bompao), como o gateway faz. */
export function userInputTokens(values: Array<string | null | undefined>): string[] {
  const tokens = new Set<string>();
  for (const raw of values) {
    const value = String(raw ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    if (!value) continue;
    tokens.add(value);
    const words = value.split(/[^a-z0-9]+/).filter((word) => word.length >= 3);
    for (const word of words) tokens.add(word);
    if (words.length > 1) tokens.add(words.join(''));
  }
  return [...tokens];
}

let scorerPromise: Promise<PasswordScorer> | null = null;

export function loadPasswordScorer(): Promise<PasswordScorer> {
  scorerPromise ??= Promise.all([
    import('@zxcvbn-ts/core'),
    import('@zxcvbn-ts/language-common'),
    import('@zxcvbn-ts/language-pt-br'),
  ]).then(([core, common, ptBr]) => {
    const factory = new core.ZxcvbnFactory({
      dictionary: { ...common.dictionary, ...ptBr.dictionary },
      graphs: common.adjacencyGraphs,
      translations: ptBr.translations,
    });
    return (password, userInputs = []) => {
      const result = factory.check(password, userInputs);
      return {
        score: result.score,
        warning: result.feedback.warning || null,
        suggestion: result.feedback.suggestions[0] ?? null,
      };
    };
  });
  return scorerPromise;
}

/** Converte a nota (0 a 4) no que a barra mostra. `check` nulo = ainda carregando. */
export function getPasswordStrength(password: string, check: PasswordCheck | null): PasswordStrength {
  const pwd = password || '';
  if (!pwd || !check) {
    return { percent: 0, label: '', color: COLORS[0], showBar: pwd.length > 0, meetsPolicy: false, hint: null };
  }
  const tooShort = pwd.length < MIN_PASSWORD_LENGTH;
  // Curta nunca passa de "Razoável", mesmo com caracteres difíceis.
  const score = tooShort ? Math.min(check.score, 2) : check.score;
  const meetsPolicy = !tooShort && score >= MIN_PASSWORD_SCORE;
  return {
    percent: (Math.max(score, 1) / 4) * 100,
    label: LABELS[score],
    color: COLORS[score],
    showBar: true,
    meetsPolicy,
    hint: meetsPolicy
      ? null
      : tooShort
        ? `Use pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`
        : check.warning ?? check.suggestion ?? 'Use uma frase ou misture palavras que não combinam.',
  };
}
