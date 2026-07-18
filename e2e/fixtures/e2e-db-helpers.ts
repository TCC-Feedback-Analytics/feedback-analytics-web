import { createClient } from '@supabase/supabase-js';

function getDatabaseAdminClient() {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!url || !key) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for E2E database helpers',
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function resetDeviceFingerprint(enterpriseId: string) {
  const supabase = getDatabaseAdminClient();
  const { error } = await supabase
    .from('tracked_devices')
    .delete()
    .eq('enterprise_id', enterpriseId);

  if (error) {
    console.warn('[e2e-db-helpers] resetDeviceFingerprint error:', error.message);
  }
}

/**
 * Resolve um ponto de coleta QR ativo para que o E2E use uma URL realista.
 * Estes helpers preparam somente dados do banco; a autenticação é responsabilidade
 * do API Gateway com Better Auth.
 */
export async function getActiveQrCollectionPoint(
  enterpriseId: string,
): Promise<{ id: string; catalogItemId: string | null } | null> {
  const supabase = getDatabaseAdminClient();
  const { data, error } = await supabase
    .from('collection_points')
    .select('id, catalog_item_id')
    .eq('enterprise_id', enterpriseId)
    .eq('type', 'QR_CODE')
    .eq('status', 'ACTIVE')
    .order('catalog_item_id', { ascending: true, nullsFirst: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn('[e2e-db-helpers] getActiveQrCollectionPoint error:', error.message);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id as string,
    catalogItemId: (data.catalog_item_id as string | null) ?? null,
  };
}
