import { useCallback, useRef } from 'react';

/**
 * Marca cada busca de um hook e diz se ela ainda é a última. Serve para
 * descartar a resposta que chega depois de uma troca de escopo ou período, ou
 * de um `reload` disparado no meio do caminho: só a busca mais recente grava
 * no estado.
 *
 * Uso: `const isLatest = startRequest();` antes do `await` e
 * `if (!isLatest()) return;` antes de cada `setState`.
 */
export function useLatestRequest(): () => () => boolean {
  const lastRequestIdRef = useRef(0);

  return useCallback(() => {
    const requestId = ++lastRequestIdRef.current;
    return () => requestId === lastRequestIdRef.current;
  }, []);
}
