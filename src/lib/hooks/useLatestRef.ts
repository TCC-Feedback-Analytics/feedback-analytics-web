import { useLayoutEffect, useRef, type RefObject } from 'react';

/**
 * Guarda o valor mais recente (em geral um callback vindo das props) para
 * efeitos e handlers lerem sem entrar nas dependências. A atualização fica num
 * efeito de layout porque o React não permite escrever em ref durante o render.
 */
export function useLatestRef<T>(value: T): RefObject<T> {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
