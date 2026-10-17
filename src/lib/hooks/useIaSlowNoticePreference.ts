import { useCallback, useState } from 'react';
import { isIaSlowNoticeEnabled, setIaSlowNoticeEnabled } from 'src/lib/utils/iaSlowNotice';

/** Preferência do aviso "a IA está demorando" para a barra da IA e a Configuração de IA. */
export function useIaSlowNoticePreference(): [boolean, (enabled: boolean) => void] {
  const [enabled, setEnabled] = useState(isIaSlowNoticeEnabled);
  const update = useCallback((next: boolean) => {
    setIaSlowNoticeEnabled(next);
    setEnabled(next);
  }, []);
  return [enabled, update];
}
