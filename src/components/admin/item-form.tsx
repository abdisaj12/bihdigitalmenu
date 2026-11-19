import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { X, ImagePlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DishImage } from '@/components/dish-image';
import { ETB } from '@/lib/format';
import { effectivePrice, totals } from '@/lib/hotel-menu';
import { STATUSES, friendlyError, type Category, type Item, type ItemInsert, type ItemType, type Settings } from '@/lib/admin-catalog';
import { MediaPicker } from './media-picker';

const LANGS = [['en', 'English'], ['am', 'Amharic'], ['om', 'Afaan Oromo']] as const;
const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

export function ItemForm({ item, type, categories, settings, onClose, onSaved }: { item: Item | ItemInsert; type: ItemType; categories: Category[]; settings: Settings | null; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<ItemInsert>({ ...item });
  const [tags, setTags] = useState((item.dietary_tags ?? []).join(', '));
  const [allergens, setAllergens] = useState((item.allergens ?? []).join(', '));
  const [picker, setPicker] = useState<'main' | 'gallery' | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof ItemInsert>(k: K, v: ItemInsert[K]) => setF((p) => ({ ...p, [k]: v }));
  const isNew = !('id' in item) || !item.id;
  const rate = settings?.vat_percent ?? 15;
  const net = effectivePrice(Number(f.price) || 0, Number(f.discount_percent) || 0);
  const t = totals(net, rate, settings?.prices_include_vat ?? false);

  async function save(e: FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!f.name_en.trim()) err.name_en = 'English name is required.';
    if (f.name_en.length > 120) err.name_en = 'Keep the name under 120 characters.';
    if (!f.category_id) err.category_id = 'Choose a category.';
    if (!(Number(f.price) > 0) || Number(f.price) > 1_000_000) err.price = 'Enter a price between 1 and 1,000,000 ETB.';
    if (Number(f.discount_percent) < 0 || Number(f.discount_percent) > 90) err.discount = 'Discount must be 0–90%.';
    if (f.status === 'available' && !f.image_url) err.image = 'Add a photo before making this item available, or set it to Hidden.';
    if (f.image_url && !f.photo_confirmed) err.image = 'Confirm the photo matches this item.';
    setErrors(err); if (Object.keys(err).length) { toast.error('Please fix the highlighted fields.'); return; }
    setBusy(true);
    const payload = { ...f, item_type: type, price: Number(f.price), discount_percent: Number(f.discount_percent) || 0, sort_order: Number(f.sort_order) || 0, prep_minutes: f.prep_minutes ? Number(f.prep_minutes) : null, dietary_tags: list(tags), allergens: list(allergens), name_am: f.name_am ?? '', name_om: f.name_om ?? '' };
    const { id, created_at: _c, updated_at: _u, is_available: _a, ...rest } = payload as Item;
    const res = isNew ? await supabase.from('menu_items').insert(rest) : await supabase.from('menu_items').update(rest).eq('id', id);
    setBusy(false);
    if (res.error) toast.error(friendlyError(res.error)); else { toast.success(`${f.name_en} saved`); onSaved(); }
  }
  const field = (k: string) => errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>;
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="admin-console max-h-[92svh] max-w-3xl overflow-y-auto bg-card text-foreground">
        <DialogHeader><DialogTitle>{isNew ? `New ${type}` : `Edit ${item.name_en}`}</DialogTitle><DialogDescription>Fields marked * are required.</DialogDescription></DialogHeader>
        <form onSubmit={save} className="grid gap-6">
          <Tabs defaultValue="en"><TabsList>{LANGS.map(([k, l]) => <TabsTrigger key={k} value={k}>{l}</TabsTrigger>)}</TabsList>
            {LANGS.map(([k]) => { const ing = (k === 'en' ? 'ingredients' : `ingredients_${k}`) as 'ingredients'; return (
              <TabsContent key={k} value={k} className="grid gap-3">
                <div className="grid gap-1.5"><Label>Name{k === 'en' && ' *'}</Label><Input maxLength={120} value={(f[`name_${k}`] as string) ?? ''} onChange={(e) => set(`name_${k}`, e.target.value)} />{k === 'en' && field('name_en')}</div>
                <div className="grid gap-1.5"><Label>Description</Label><Textarea maxLength={1000} value={(f[`description_${k}`] as string) ?? ''} onChange={(e) => set(`description_${k}`, e.target.value)} /></div>
                <div className="grid gap-1.5"><Label>Ingredients</Label><Textarea maxLength={1000} value={(f[ing] as string) ?? ''} onChange={(e) => set(ing, e.target.value)} /></div>
              </TabsContent>); })}
          </Tabs>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5"><Label>Category *</Label><Select value={f.category_id} onValueChange={(v) => set('category_id', v)}><SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger><SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.parent_id ? '— ' : ''}{c.name_en}</SelectItem>)}</SelectContent></Select>{field('category_id')}</div>
            <div className="grid gap-1.5"><Label>Subcategory</Label><Input maxLength={60} placeholder={type === 'meal' ? 'e.g. Vegetarian' : 'e.g. Red wine'} value={f.subcategory ?? ''} onChange={(e) => set('subcategory', e.target.value || null)} /></div>
            <div className="grid gap-1.5"><Label>Price (ETB) *</Label><Input type="number" min={0} step="0.01" value={f.price} onChange={(e) => set('price', Number(e.target.value))} />{field('price')}</div>
            <div className="grid gap-1.5"><Label>Discount %</Label><Input type="number" min={0} max={90} value={f.discount_percent ?? 0} onChange={(e) => set('discount_percent', Number(e.target.value))} />{field('discount')}</div>
            {type === 'meal' ? <div className="grid gap-1.5"><Label>Preparation time (minutes)</Label><Input type="number" min={0} max={600} value={f.prep_minutes ?? ''} onChange={(e) => set('prep_minutes', e.target.value ? Number(e.target.value) : null)} /></div>
              : <div className="grid gap-1.5"><Label>Size or volume</Label><Input maxLength={40} placeholder="e.g. 330 ml, Glass, Bottle" value={f.size ?? ''} onChange={(e) => set('size', e.target.value || null)} /></div>}
            <div className="grid gap-1.5"><Label>Display order</Label><Input type="number" value={f.sort_order ?? 0} onChange={(e) => set('sort_order', Number(e.target.value))} /></div>
            <div className="grid gap-1.5"><Label>Dietary tags (comma separated)</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="vegetarian, fasting" /></div>
            <div className="grid gap-1.5"><Label>Allergens (comma separated)</Label><Input value={allergens} onChange={(e) => setAllergens(e.target.value)} placeholder="gluten, dairy" /></div>
            <div className="grid gap-1.5"><Label>Availability</Label><Select value={f.status ?? 'available'} onValueChange={(v) => set('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
            <label className="flex items-center gap-3 self-end rounded-lg border p-3 text-sm"><Switch checked={!!f.is_featured} onCheckedChange={(v) => set('is_featured', v)} />Featured on the guest menu</label>
          </div>
          <div className="rounded-xl bg-muted p-4 text-sm"><p className="font-medium">Guest pays</p><p className="mt-1 text-muted-foreground">{ETB(t.subtotal)} + {rate}% VAT {ETB(t.vat)} = <span className="font-semibold text-foreground">{ETB(t.total)}</span> {settings?.prices_include_vat ? '(price already includes VAT)' : '(VAT added at checkout)'}</p></div>
          <div className="grid gap-3">
            <Label>Main image</Label>
            <div className="flex flex-wrap items-start gap-4">
              <div className="aspect-[4/3] w-48 overflow-hidden rounded-xl border"><DishImage src={f.image_url ?? null} name={f.name_en || 'No photo'} /></div>
              <div className="flex flex-col gap-2"><Button type="button" variant="outline" onClick={() => setPicker('main')}><ImagePlus />{f.image_url ? 'Replace image' : 'Choose image'}</Button>{f.image_url && <Button type="button" variant="ghost" onClick={() => { set('image_url', null); set('photo_confirmed', false); }}>Remove image</Button>}</div>
            </div>
            {f.image_url && <label className="flex items-center gap-2 text-sm"><Checkbox checked={!!f.photo_confirmed} onCheckedChange={(v) => set('photo_confirmed', !!v)} />This photo matches “{f.name_en || 'this item'}”</label>}
            {field('image')}
            <Label className="mt-2">Additional images</Label>
            <div className="flex flex-wrap gap-2">{(f.gallery ?? []).map((g) => <div key={g} className="relative size-20 overflow-hidden rounded-lg border"><DishImage src={g} name="" /><button type="button" aria-label="Remove image" className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-card" onClick={() => set('gallery', (f.gallery ?? []).filter((x) => x !== g))}><X className="size-3" /></button></div>)}
              <Button type="button" variant="outline" className="size-20" aria-label="Add images" onClick={() => setPicker('gallery')}><ImagePlus /></Button></div>
          </div>
          <div className="sticky bottom-0 -mx-6 -mb-6 flex justify-end gap-2 border-t bg-card p-4"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button></div>
        </form>
        <MediaPicker open={!!picker} multiple={picker === 'gallery'} onClose={() => setPicker(null)} onPick={(refs) => { if (picker === 'main') { set('image_url', refs[0]); set('photo_confirmed', false); } else set('gallery', [...new Set([...(f.gallery ?? []), ...refs])]); }} />
      </DialogContent>
    </Dialog>
  );
}
