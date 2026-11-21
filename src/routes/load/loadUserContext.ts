import { ServiceGetUser, type AuthUserWithDeletion } from 'src/services/serviceUser';
import {
  ServiceGetCollectingDataEnterprise,
  ServiceGetEnterprise,
} from 'src/services/serviceEnterprise';
import type {
  ApiEnterpriseResponse,
  CollectingDataEnterprise,
  EnterpriseContext,
} from 'lib/interfaces/entities/enterprise.entity';
import { ServiceGetIaConfig, type IaConfigResponse } from 'src/services/serviceIaConfig';

export async function loadUserContextData() {
  const [auth, enterprisePayload, iaConfig] = (await Promise.all([
    ServiceGetUser(),
    ServiceGetEnterprise().catch(() => null),
    ServiceGetIaConfig().catch(() => null),
  ])) as [AuthUserWithDeletion, ApiEnterpriseResponse | null, IaConfigResponse | null];

  const user = auth.user;
  const collecting = enterprisePayload
    ? ((await ServiceGetCollectingDataEnterprise().catch(
        () => null,
      )) as CollectingDataEnterprise | null)
    : null;

  const enterprise: EnterpriseContext = enterprisePayload?.enterprise
    ? {
        ...enterprisePayload.enterprise,
        email: user.email ?? null,
        phone: user.phone ?? null,
        full_name: user.user_metadata?.full_name ?? null,
      }
    : {
        id: '',
        created_at: '',
        trial_ends_at: null,
        subscription_status: 'TRIAL',
        email: user.email ?? null,
        phone: user.phone ?? null,
        full_name: user.user_metadata?.full_name ?? null,
      };

  return {
    user,
    enterprise,
    collecting,
    iaConfig,
    // Conta com exclusão agendada: a área logada dá lugar ao aviso para desistir.
    deletionScheduledFor: auth.deletion_scheduled_for ?? null,
  };
}
