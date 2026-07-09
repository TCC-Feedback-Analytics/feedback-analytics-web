import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!url || !key) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for E2E helpers',
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function resetDeviceFingerprint(enterpriseId: string) {
  const supabase = getAdminClient();
  const { error } = await supabase
    .from('tracked_devices')
    .delete()
    .eq('enterprise_id', enterpriseId);

  if (error) {
    console.warn('[supabase-helpers] resetDeviceFingerprint error:', error.message);
  }
}

export async function deleteUserByEmail(email: string) {
  const supabase = getAdminClient();

  const { data, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.warn('[supabase-helpers] listUsers error:', listError.message);
    return;
  }

  const user = data?.users?.find((u) => u.email === email);
  if (!user) return;

  const { error } = await supabase.auth.admin.deleteUser(user.id);
  if (error) {
    console.warn('[supabase-helpers] deleteUser error:', error.message);
  }
}

export async function getEnterpriseIdByAuthUser(email: string): Promise<string | null> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('enterprises')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (error || !data) return null;
  return data.id as string;
}

/**
 * Resolve um ponto de coleta QR ATIVO da empresa para que o e2e use uma URL
 * realista (`?enterprise=...&collection_point=...`). Prioriza o escopo empresa
 * (`catalog_item_id IS NULL`) — o mesmo ponto que o submit exige. Retorna null
 * quando a empresa não tem nenhum ponto QR ativo (config inconsistente no banco).
 */
export async function getActiveQrCollectionPoint(
  enterpriseId: string,
): Promise<{ id: string; catalogItemId: string | null } | null> {
  const supabase = getAdminClient();
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
    console.warn('[supabase-helpers] getActiveQrCollectionPoint error:', error.message);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id as string,
    catalogItemId: (data.catalog_item_id as string | null) ?? null,
  };
}

export async function ensureTestUserExists(email: string, password: string, enterpriseId?: string) {
  try {
    const supabase = getAdminClient();
    console.log(`[supabase-helpers] Checking if test user exists: ${email}`);
    const { data, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.warn('[supabase-helpers] listUsers error:', listError.message);
      return;
    }

    const user = data?.users?.find((u: any) => u.email === email);
    if (!user) {
      console.log(`[supabase-helpers] Creating test user ${email}...`);
      const { error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Gestor Teste' },
      });
      if (createError) {
        console.warn('[supabase-helpers] createUser error:', createError.message);
      } else {
        console.log(`[supabase-helpers] Test user ${email} created successfully.`);
      }
    } else {
      console.log(`[supabase-helpers] Updating test user ${email}...`);
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Gestor Teste' },
      });
      if (updateError) {
        console.warn('[supabase-helpers] updateUserById error:', updateError.message);
      } else {
        console.log(`[supabase-helpers] Test user ${email} updated/confirmed successfully.`);
      }
    }

    if (enterpriseId) {
      console.log(`[supabase-helpers] Ensuring enterprise exists: ${enterpriseId} for ${email}`);
      const { data: entData, error: entError } = await supabase
        .from('enterprises')
        .select('id')
        .eq('id', enterpriseId)
        .maybeSingle();

      if (entError) {
        console.warn('[supabase-helpers] error querying enterprise:', entError.message);
      }

      if (!entData) {
        console.log(`[supabase-helpers] Inserting enterprise ${enterpriseId} linked to ${email}...`);
        const { error: insertError } = await supabase
          .from('enterprises')
          .insert({
            id: enterpriseId,
            email: email,
            document: '529.982.247-25',
            subscription_status: 'TRIAL',
          });
        if (insertError) {
          console.warn('[supabase-helpers] insert enterprise error:', insertError.message);
        } else {
          console.log('[supabase-helpers] Enterprise inserted successfully.');
        }
      } else {
        // Se a empresa existe, garante que o e-mail está associado a ela
        const { error: updateEntError } = await supabase
          .from('enterprises')
          .update({ email })
          .eq('id', enterpriseId);
        if (updateEntError) {
          console.warn('[supabase-helpers] update enterprise email error:', updateEntError.message);
        }
      }
    }
  } catch (err: any) {
    console.warn('[supabase-helpers] ensureTestUserExists error:', err.message || err);
  }
}
