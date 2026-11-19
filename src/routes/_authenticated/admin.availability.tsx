import { createFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/page-parts';
import { STATUSES, friendlyError, useCatalog } from '@/lib/admin-catalog';
export const Route = createFileRoute('/_authenticated/admin/availability')({
  head: () => ({ meta: [{ title: 'Availability — Bulcha Admin' }, { name: 'description', content: 'Quickly mark menu items available, sold out or hidden.' }, { property: 'og:title', content: 'Availability — Bulcha Admin' }, { property: 'og:description', content: 'Menu availability controls.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: Availability,
});
function Availability() {
  const { data, isLoading, refresh } = useCatalog();
  async function set(id: string, status: string) { const { error } = await supabase.from('menu_items').update({ status }).eq('id', id); if (error) toast.error(friendlyError(error)); else { toast.success('Updated'); refresh(); } }
  const items = (data?.items ?? []).filter((i) => !i.deleted_at);
  return <div className="space-y-5"><PageHeader title="Availability" subtitle="Bulk changes are on the Meals and Drinks pages." />
    {isLoading ? <p className="text-muted-foreground">Loading…</p> : <div className="divide-y rounded-xl border bg-card">{items.map((i) => <div key={i.id} className="flex flex-wrap items-center justify-between gap-2 p-3"><span className="font-medium">{i.name_en} <span className="text-xs text-muted-foreground">· {i.item_type}</span></span><div className="flex flex-wrap gap-1">{STATUSES.map((s) => <Button key={s.value} size="sm" variant={i.status === s.value ? 'default' : 'outline'} aria-pressed={i.status === s.value} onClick={() => set(i.id, s.value)}>{s.label}</Button>)}</div></div>)}</div>}
  </div>;
}
