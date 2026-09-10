import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useFetcher, useLoaderData, useRouteLoaderData } from 'react-router-dom';
import type { CatalogItem, CatalogItemInput, CollectingDataEnterprise } from 'lib/interfaces/entities/enterprise.entity';
import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';
import type { QrCodeCatalogLoadData } from 'src/routes/load/loadQrCodeCatalog';
import { CATALOG_KINDS } from 'src/lib/constants/catalog';
import { useToast } from 'components/public/forms/messages/useToast';
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from 'components/ui/dialog';
import { Input } from 'components/ui/input';
import { FaBoxOpen, FaChevronRight, FaFloppyDisk, FaPlus, FaTrashCan, FaXmark } from 'react-icons/fa6';
import type { CatalogItemsListProps } from './ui.types';

function toCatalogInput(item: CatalogItem): CatalogItemInput {
  return { id: item.id, name: item.name, description: item.description ?? null, sort_order: item.sort_order, status: item.status ?? 'ACTIVE' };
}

export default function CatalogItemsList({ kindSlug }: CatalogItemsListProps) {
  const config = CATALOG_KINDS[kindSlug];
  const { collecting } = useRouteLoaderData('user') as { collecting: CollectingDataEnterprise | null };
  const qrData = useLoaderData() as QrCodeCatalogLoadData;
  const toast = useToast();
  const fetcher = useFetcher<ActionData>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const items = useMemo(() => (collecting?.[config.itemsKey] ?? []) as CatalogItem[], [collecting, config.itemsKey]);
  const activeById = useMemo(() => new Map((qrData?.items ?? []).map((entry) => [entry.catalog_item_id, entry.active])), [qrData]);
  const busy = fetcher.state !== 'idle';

  useEffect(() => {
    const data = fetcher.data;
    if (!data) return;
    if (data.ok) {
      toast.success('Catálogo atualizado!', data.message || 'Lista salva.');
      setDialogOpen(false);
      setNewName('');
      setNewDescription('');
    } else {
      toast.error('Erro ao salvar', data.message || 'Tente novamente em instantes.');
    }
  }, [fetcher.data, toast]);

  const submitList = useCallback((nextItems: CatalogItemInput[]) => {
    fetcher.submit({ intent: config.saveIntent, catalog_items: JSON.stringify(nextItems) }, { method: 'post' });
  }, [config.saveIntent, fetcher]);

  const handleAdd = useCallback((event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed || busy) return;
    submitList([
      ...items.map(toCatalogInput),
      { name: trimmed, description: newDescription.trim() || null, status: 'ACTIVE', sort_order: items.length },
    ]);
  }, [busy, items, newDescription, newName, submitList]);

  const handleRemove = useCallback((id: string | undefined) => {
    if (!id || busy) return;
    const next = items.filter((entry) => entry.id !== id).map((entry, index) => ({ ...toCatalogInput(entry), sort_order: index }));
    submitList(next);
  }, [busy, items, submitList]);

  return (
    <div className="font-work-sans relative space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-secondary) p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--primary-color)/12 text-(--primary-color)"><FaBoxOpen aria-hidden /></div>
          <div><h2 className="font-montserrat text-lg font-semibold text-(--text-primary)">{config.plural}</h2><p className="mt-1 text-sm text-(--text-secondary)">{items.length} {items.length === 1 ? 'item cadastrado' : 'itens cadastrados'}</p></div>
        </div>
        <button type="button" onClick={() => setDialogOpen(true)} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-(--primary-color) px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-(--secondary-color)"><FaPlus aria-hidden /> Cadastrar {config.singular}</button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-(--quaternary-color)/18 bg-(--bg-secondary)/50 px-5 py-12 text-center"><FaBoxOpen className="mx-auto mb-3 text-2xl text-(--text-tertiary)" aria-hidden /><p className="font-semibold text-(--text-primary)">Nenhum {config.singular} cadastrado</p><p className="mt-1 text-sm text-(--text-secondary)">Comece adicionando o primeiro item.</p><button type="button" onClick={() => setDialogOpen(true)} className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-(--primary-color)/30 px-4 py-2.5 text-sm font-semibold text-(--primary-color) transition hover:bg-(--primary-color)/10"><FaPlus aria-hidden /> Cadastrar {config.singular}</button></div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const isActive = item.id ? activeById.get(item.id) === true : false;
            const detailPath = `/user/edit/feedback/${config.slug}/${item.id}`;
            return (
              <li key={item.id ?? item.name} className="flex flex-col gap-4 rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-secondary) p-4 transition-colors hover:border-(--primary-color)/30 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1"><p className="truncate text-base font-semibold text-(--text-primary)">{item.name || 'Sem nome'}</p>{item.description && <p className="mt-1 truncate text-sm text-(--text-tertiary)">{item.description}</p>}</div>
                <span className={`inline-flex w-fit shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ${isActive ? 'bg-(--positive)/12 text-(--positive)' : 'bg-(--seventh-color) text-(--text-tertiary)'}`}>{isActive ? 'QR ativo' : 'QR inativo'}</span>
                <div className="flex items-center gap-2 sm:shrink-0"><button type="button" onClick={() => handleRemove(item.id)} disabled={busy} aria-label={`Remover ${item.name || 'item'}`} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-(--text-tertiary) transition hover:bg-(--negative)/10 hover:text-(--negative) disabled:cursor-not-allowed disabled:opacity-60"><FaTrashCan aria-hidden /> Remover</button><Link to={detailPath} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-(--primary-color)/30 bg-(--primary-color)/10 px-3.5 py-2 text-sm font-semibold text-(--primary-color) transition hover:bg-(--primary-color)/20">Configurar <FaChevronRight aria-hidden className="text-xs" /></Link></div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-(--primary-color)/12 text-(--primary-color)"><FaPlus aria-hidden /></div><DialogTitle>Cadastrar {config.singular}</DialogTitle><DialogDescription>Adicione um item ao catálogo de {config.plural.toLowerCase()}.</DialogDescription></DialogHeader>
          <form id="catalog-item-form" onSubmit={handleAdd}>
            <DialogBody className="space-y-5">
              <div><label htmlFor="catalog-item-name" className="mb-2 block text-sm font-semibold text-(--text-primary)">Nome</label><Input id="catalog-item-name" value={newName} onChange={(event) => setNewName(event.target.value)} placeholder={`Ex.: ${config.singular === 'produto' ? 'Produto Premium' : config.singular === 'serviço' ? 'Consultoria' : 'Atendimento'}`} autoFocus required /></div>
              <div><label htmlFor="catalog-item-description" className="mb-2 block text-sm font-semibold text-(--text-primary)">Descrição <span className="font-normal text-(--text-tertiary)">(opcional)</span></label><textarea id="catalog-item-description" value={newDescription} onChange={(event) => setNewDescription(event.target.value)} rows={4} placeholder="Uma descrição curta para identificar este item" className="w-full resize-y rounded-xl border border-(--quaternary-color)/18 bg-(--seventh-color) px-4 py-3 text-sm text-(--text-primary) outline-none transition focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20" /></div>
            </DialogBody>
          </form>
          <DialogFooter><button type="button" onClick={() => setDialogOpen(false)} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-(--text-secondary) transition hover:bg-(--seventh-color)"><FaXmark aria-hidden /> Cancelar</button><button type="submit" form="catalog-item-form" disabled={busy || !newName.trim()} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-(--primary-color) px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-(--secondary-color) disabled:cursor-not-allowed disabled:opacity-50"><FaFloppyDisk aria-hidden /> {busy ? 'Salvando…' : 'Cadastrar'}</button></DialogFooter>
        </DialogContent>
      </Dialog>

      {busy && <div className="pointer-events-none absolute inset-0 rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-primary)/35 backdrop-blur-[1px]" />}
    </div>
  );
}
