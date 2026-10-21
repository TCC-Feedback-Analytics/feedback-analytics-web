import { useEffect, useMemo, useState } from 'react';
import {
  getPasswordStrength,
  loadPasswordScorer,
  userInputTokens,
  type PasswordCheck,
  type PasswordStrength,
} from 'src/lib/utils/passwordStrength';

/**
 * Força da senha enquanto a pessoa digita. Carrega o zxcvbn na primeira letra;
 * `userInputs` (nome do negócio, e-mail, telefone) não podem compor a senha.
 */
export function usePasswordStrength(password: string, userInputs: Array<string | null | undefined> = []): PasswordStrength {
  const inputsKey = userInputTokens(userInputs).join('|');
  const [result, setResult] = useState<{ key: string; check: PasswordCheck } | null>(null);
  const key = `${password}\u0000${inputsKey}`;

  useEffect(() => {
    if (!password) return;
    let cancelled = false;
    loadPasswordScorer()
      .then((score) => {
        if (!cancelled) setResult({ key, check: score(password, inputsKey ? inputsKey.split('|') : []) });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [key, password, inputsKey]);

  return useMemo(
    () => getPasswordStrength(password, result && result.key === key ? result.check : null),
    [password, result, key],
  );
}
