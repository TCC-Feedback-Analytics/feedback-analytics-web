import type {
  ScopeDiagnosis,
  ScopeDiagnosisFinding,
} from 'lib/interfaces/contracts/ia-analyze/scope-diagnosis.contract';
import type { ScopeDiagnosisSummary } from 'src/services/serviceScopeDiagnosis';

/**
 * Props do resultado de um diagnóstico do escopo.
 * Usado em: components/user/pages/diagnosis/DiagnosisResult.tsx.
 */
export interface DiagnosisResultProps {
  diagnosis: ScopeDiagnosis;
}

export interface DiagnosisFindingListProps {
  title: string;
  items: ScopeDiagnosisFinding[];
  empty: string;
}

/**
 * Props de uma linha do histórico de diagnósticos (abre o diagnóstico completo).
 * Usado em: components/user/pages/diagnosis/DiagnosisHistoryItem.tsx.
 */
export interface DiagnosisHistoryItemProps {
  item: ScopeDiagnosisSummary;
  /** O mais recente do escopo vem aberto. */
  defaultOpen?: boolean;
}
