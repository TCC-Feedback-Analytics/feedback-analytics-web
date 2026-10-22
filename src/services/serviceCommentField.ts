import type {
  CommentFieldSettings,
  CommentFieldSettingsInput,
} from 'lib/schemas/public/commentField';
import { getJson, putJson } from 'src/lib/utils/http';

type CommentFieldTarget = {
  scopeType: CommentFieldSettingsInput['scope_type'];
  catalogItemId: string | null;
};

/** Campo de comentário do formulário de um escopo (empresa ou item do catálogo). */
export function ServiceGetCommentField({ scopeType, catalogItemId }: CommentFieldTarget) {
  const search = new URLSearchParams({ scope_type: scopeType });
  if (catalogItemId) search.set('catalog_item_id', catalogItemId);
  return getJson<CommentFieldSettings>(`/api/protected/user/collection-points/comment-field?${search.toString()}`);
}

export function ServiceSaveCommentField(
  { scopeType, catalogItemId }: CommentFieldTarget,
  settings: CommentFieldSettings,
) {
  return putJson<CommentFieldSettings>('/api/protected/user/collection-points/comment-field', {
    scope_type: scopeType,
    catalog_item_id: catalogItemId,
    mode: settings.mode,
    prompt: settings.mode === 'CUSTOM' ? settings.prompt : null,
  });
}
