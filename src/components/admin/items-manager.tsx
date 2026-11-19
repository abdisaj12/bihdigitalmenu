import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Copy, Pencil, Trash2, RotateCcw, Plus, Search, Star, ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DishImage } from '@/components/dish-image';
import { ETB } from '@/lib/format';
import { effectivePrice } from '@/lib/hotel-menu';
import { STATUSES, statusLabel, useCatalog, friendlyError, type Item, type ItemType, type ItemInsert } from '@/lib/admin-catalog';
import { ItemForm } from './item-form';
import { PageHeader, EmptyState, LoadingRows } from './page-parts';

const PAGE = 15;
type Sort = 'order' | 'price_asc' | 'price_desc' | 'newest' | 'oldest';

export function ItemsManager({ type, initialQuery = '', openNew = false }: { type: ItemType; initialQuery?: string; openNew?: boolean }) {
  const { data, isLoading, error, refresh } = useCatalog();
  const [q, setQ] = useState(initialQuery);
  const [cat, setCat] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState<Sort>('order');
  const [trash, setTrash] = useState(false);
  const [page, setPage] = useState(1);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Item | ItemInsert | null>(null);
  const [confirm, setConfirm] = useState<{ ids: string[]; permanent: boolean } | null>(null);
  useEffect(() => setQ(initialQuery), [initialQuery]);
  const noun = type === 'meal' ? 'meal' : 'drink';
  const cats = (data?.categories ?? []).filter((c) => (data?.items ?? []).some((i) => i.category_id === c.id && i.item_type === type) || true);
  useEffect(() => { if (openNew && data) setEditing({ ...blank(type, data.categories[0]?.id ?? '') }); }, [openNew, data, type]);

  const rows = useMemo(() => {
    let r = (data?.items ?? []).filter((i) => i.item_type === type && (trash ? !!i.deleted_at : !i.deleted_at));
    if (q.trim()) { const s = q.toLowerCase(); r = r.filter((i) => `${i.name_en} ${i.name_am} ${i.name_om} ${i.subcategory ?? ''}`.toLowerCase().includes(s)); }
    if (cat !== 'all') r = r.filter((i) => i.category_id === cat);
    if (status !== 'all') r = r.filter((i) => i.status === status);
    const by: Record<Sort, (a: Item, b: Item) => number> = {
      order: (a, b) => a.sort_order - b.sort_order, price_asc: (a, b) => a.price - b.price, price_desc: (a, b) => b.price - a.price,
      newest: (a, b) => b.created_at.localeCompare(a.created_at), oldest: (a, b) => a.created_at.localeCompare(b.created_at),
    };
    return [...r].sort(by[sort]);
  }, [data, type, trash, q, cat, status, sort]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const view = rows.slice((Math.min(page, pages) - 1) * PAGE, Math.min(page, pages) * PAGE);
  useEffect(() => { setPage(1); setSel(new Set()); }, [q, cat, status, trash, sort]);
  const catName = (id: string) => data?.categories.find((c) => c.id === id)?.name_en ?? '—';
  const allOnPage = view.length > 0 && view.every((i) => sel.has(i.id));

  async function run(label: string, fn: () => PromiseLike<{ error: unknown }>) {
    const { error } = await fn();
    if (error) toast.error(friendlyError(error)); else { toast.success(label); setSel(new Set()); refresh(); }
  }
  const ids = [...sel];
  const softDelete = (list: string[]) => run(`${list.length} moved to trash`, () => supabase.from('menu_items').update({ deleted_at: new Date().toISOString() }).in('id', list));
  const restore = (list: string[]) => run(`${list.length} restored`, () => supabase.from('menu_items').update({ deleted_at: null }).in('id', list));
  const purge = (list: string[]) => run(`${list.length} permanently deleted`, () => supabase.from('menu_items').delete().in('id', list));
  const setStatusBulk = (s: string) => run(`Status set to ${statusLabel(s)}`, () => supabase.from('menu_items').update({ status: s }).in('id', ids));
  async function duplicate(i: Item) {
    const { id: _id, created_at: _c, updated_at: _u, is_available: _a, deleted_at: _d, ...rest } = i;
    await run(`${i.name_en} duplicated`, () => supabase.from('menu_items').insert({ ...rest, name_en: `${i.name_en} (copy)`, status: 'hidden', is_featured: false, sort_order: i.sort_order + 1 }));
  }
  async function toggleFeatured(i: Item) { await run(i.is_featured ? 'Removed from featured' : 'Featured', () => supabase.from('menu_items').update({ is_featured: !i.is_featured }).eq('id', i.id)); }

  if (error) return <EmptyState title="Could not load items" body={friendlyError(error)} action={<Button onClick={refresh}>Try again</Button>} />;
  return (
    <div className="space-y-5">
      <PageHeader title={type === 'meal' ? 'Meals' : 'Drinks'} subtitle={`${rows.length} ${trash ? 'in trash' : `${noun}s`}`}
        actions={<><Button variant={trash ? 'default' : 'outline'} onClick={() => setTrash(!trash)}><Trash2 />{trash ? 'Back to list' : 'Trash'}</Button>
          {!trash && <Button onClick={() => setEditing(blank(type, data?.categories[0]?.id ?? ''))}><Plus />New {noun}</Button>}</>} />
      <div className="flex flex-wrap gap-2 rounded-xl border bg-card p-3">
        <div className="relative min-w-52 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search by name" placeholder="Search by name" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <Select value={cat} onValueChange={setCat}><SelectTrigger className="w-44" aria-label="Category"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem>{cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name_en}</SelectItem>)}</SelectContent></Select>
        <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-40" aria-label="Availability"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Any status</SelectItem>{STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select>
        <Select value={sort} onValueChange={(v) => setSort(v as Sort)}><SelectTrigger className="w-44" aria-label="Sort"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="order">Display order</SelectItem><SelectItem value="price_asc">Price: low to high</SelectItem><SelectItem value="price_desc">Price: high to low</SelectItem><SelectItem value="newest">Newest first</SelectItem><SelectItem value="oldest">Oldest first</SelectItem></SelectContent></Select>
      </div>
      {sel.size > 0 && <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-accent px-4 py-2 text-sm">
        <span className="mr-2 font-medium">{sel.size} selected</span>
        {trash ? <><Button size="sm" variant="outline" onClick={() => restore(ids)}><RotateCcw />Restore</Button><Button size="sm" variant="destructive" onClick={() => setConfirm({ ids, permanent: true })}>Delete forever</Button></>
          : <><Select onValueChange={setStatusBulk}><SelectTrigger className="h-8 w-40"><SelectValue placeholder="Set status…" /></SelectTrigger><SelectContent>{STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select>
            <Button size="sm" variant="destructive" onClick={() => setConfirm({ ids, permanent: false })}><Trash2 />Delete</Button></>}
        <Button size="sm" variant="ghost" onClick={() => setSel(new Set())}>Clear</Button>
      </div>}
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground"><tr>
            <th className="w-10 p-3"><Checkbox aria-label="Select all on page" checked={allOnPage} onCheckedChange={(v) => { const n = new Set(sel); view.forEach((i) => (v ? n.add(i.id) : n.delete(i.id))); setSel(n); }} /></th>
            <th className="p-3">{type === 'meal' ? 'Meal' : 'Drink'}</th><th className="p-3">Category</th><th className="p-3 text-right">Price</th><th className="p-3">Status</th><th className="p-3 text-center">Featured</th><th className="p-3 text-right">Actions</th></tr></thead>
          <tbody>
            {isLoading ? <LoadingRows cols={7} /> : view.length === 0 ? <tr><td colSpan={7}><EmptyState title={trash ? 'Trash is empty' : `No ${noun}s found`} body={trash ? 'Deleted items appear here and can be restored.' : 'Try another search or create a new one.'} /></td></tr>
              : view.map((i) => <tr key={i.id} className="border-b last:border-0 hover:bg-muted/40">
                <td className="p-3"><Checkbox aria-label={`Select ${i.name_en}`} checked={sel.has(i.id)} onCheckedChange={(v) => { const n = new Set(sel); v ? n.add(i.id) : n.delete(i.id); setSel(n); }} /></td>
                <td className="p-3"><div className="flex items-center gap-3"><div className="size-12 shrink-0 overflow-hidden rounded-lg [&_.dish-placeholder_span:nth-child(2)]:text-[8px]"><DishImage src={i.image_url} name={i.name_en} /></div><div className="min-w-0"><p className="truncate font-medium">{i.name_en}</p><p className="truncate text-xs text-muted-foreground">{[i.subcategory, i.size, i.prep_minutes ? `${i.prep_minutes} min` : null].filter(Boolean).join(' · ') || (i.image_url ? '' : <span className="inline-flex items-center gap-1"><ImageIcon className="size-3" />No photo</span>)}</p></div></div></td>
                <td className="p-3 text-muted-foreground">{catName(i.category_id)}</td>
                <td className="p-3 text-right tabular-nums">{i.discount_percent > 0 ? <><span className="mr-1 text-xs text-muted-foreground line-through">{ETB(i.price)}</span>{ETB(effectivePrice(i.price, i.discount_percent))}</> : ETB(i.price)}</td>
                <td className="p-3"><Badge variant={i.status === 'available' ? 'default' : i.status === 'sold_out' ? 'destructive' : 'secondary'}>{statusLabel(i.status)}</Badge></td>
                <td className="p-3 text-center"><Switch aria-label={`Feature ${i.name_en}`} checked={i.is_featured} disabled={trash} onCheckedChange={() => toggleFeatured(i)} /></td>
                <td className="p-3"><div className="flex justify-end gap-1">
                  {trash ? <><Button size="icon" variant="ghost" aria-label="Restore" onClick={() => restore([i.id])}><RotateCcw /></Button><Button size="icon" variant="ghost" aria-label="Delete forever" onClick={() => setConfirm({ ids: [i.id], permanent: true })}><Trash2 /></Button></>
                    : <><Button size="icon" variant="ghost" aria-label={`Edit ${i.name_en}`} onClick={() => setEditing(i)}><Pencil /></Button><Button size="icon" variant="ghost" aria-label={`Duplicate ${i.name_en}`} onClick={() => duplicate(i)}><Copy /></Button><Button size="icon" variant="ghost" aria-label={`Delete ${i.name_en}`} onClick={() => setConfirm({ ids: [i.id], permanent: false })}><Trash2 /></Button></>}
                </div></td>
              </tr>)}
          </tbody>
        </table>
      </div>
      {pages > 1 && <div className="flex items-center justify-between text-sm text-muted-foreground"><span>Page {Math.min(page, pages)} of {pages}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</Button></div></div>}
      {editing && data && <ItemForm item={editing} type={type} categories={data.categories} settings={data.settings} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
      <AlertDialog open={!!confirm} onOpenChange={(v) => !v && setConfirm(null)}><AlertDialogContent><AlertDialogHeader>
        <AlertDialogTitle>{confirm?.permanent ? 'Delete permanently?' : 'Move to trash?'}</AlertDialogTitle>
        <AlertDialogDescription>{confirm?.permanent ? `${confirm.ids.length} item(s) will be removed forever. This cannot be undone.` : `${confirm?.ids.length} item(s) will be hidden from guests. You can restore them from Trash.`}</AlertDialogDescription>
      </AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { if (confirm) (confirm.permanent ? purge : softDelete)(confirm.ids); setConfirm(null); }}>{confirm?.permanent ? 'Delete forever' : 'Move to trash'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}
function blank(type: ItemType, categoryId: string): ItemInsert {
  return { item_type: type, category_id: categoryId, name_en: '', name_am: '', name_om: '', description_en: '', description_am: '', description_om: '', ingredients: '', ingredients_am: '', ingredients_om: '', price: 0, discount_percent: 0, image_url: null, gallery: [], dietary_tags: [], allergens: [], status: 'available', is_featured: false, sort_order: 0, photo_confirmed: false, subcategory: null, prep_minutes: null, size: null };
}
export { Star };
