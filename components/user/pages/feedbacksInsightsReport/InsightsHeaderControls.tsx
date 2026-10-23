import { ScopeSelectorDropdown } from './ScopeSelectorDropdown';
import { CatalogItemDropdown } from './CatalogItemDropdown';
import type { InsightsHeaderControlsProps } from './ui.types';

/**
 * Seletor de escopo (+ item de catálogo) do header usando menus dropdown intuitivos.
 */
export default function InsightsHeaderControls({
  availableScopes,
  selectedScope,
  selectedCatalogItemId,
  catalogItemOptions,
  onScopeChange,
  onCatalogItemChange,
}: InsightsHeaderControlsProps) {
  const itemSelectionEnabled = selectedScope !== 'COMPANY';
  const filteredCatalogItems = catalogItemOptions.filter(
    (item) => item.kind === selectedScope,
  );

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
      <ScopeSelectorDropdown
        options={availableScopes}
        selected={selectedScope}
        onChange={onScopeChange}
      />

      {itemSelectionEnabled && filteredCatalogItems.length > 0 && (
        <CatalogItemDropdown
          scope={selectedScope}
          items={filteredCatalogItems}
          selectedId={selectedCatalogItemId}
          onChange={onCatalogItemChange}
        />
      )}
    </div>
  );
}
