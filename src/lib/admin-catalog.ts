import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import type { Database } from '@/integrations/supabase/types';

export type Item = Database['public']['Tables']['menu_items']['Row'];
export type ItemInsert = Database['public']['Tables']['menu_items']['Insert'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Settings = Database['public']['Tables']['settings']['Row'];
export type Activity = Database['public']['Tables']['admin_activity']['Row'];
export type ItemType = 'meal' | 'drink';
export const STATUSES = [
  { value: 'available', label: 'Available' },
  { value: 'unavailable', label: 'Unavailable' },
  { value: 'sold_out', label: 'Sold out' },
  { value: 'hidden', label: 'Hidden' },
] as const;
export type ItemStatus = (typeof STATUSES)[number]['value'];
export const statusLabel = (s: string) => STATUSES.find((x) => x.value === s)?.label ?? s;

export const catalogOptions = queryOptions({
  queryKey: ['admin-catalog'],
  queryFn: async () => {
    const [items, categories, settings] = await Promise.all([
      supabase.from('menu_items').select('*').order('sort_order'),
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('settings').select('*').eq('id', true).maybeSingle(),
    ]);
    if (items.error || categories.error || settings.error) throw new Error('Could not load the menu. Please refresh.');
    return { items: items.data ?? [], categories: categories.data ?? [], settings: settings.data };
  },
});

export function useCatalog() {
  const qc = useQueryClient();
  const q = useQuery(catalogOptions);
  return { ...q, refresh: () => qc.invalidateQueries({ queryKey: ['admin-catalog'] }) };
}

export function usePermissions() {
  const { roles, user } = useAuth();
  const isSuper = roles.includes('super_admin');
  return { isSuper, isAdmin: isSuper || roles.includes('admin'), user, roleLabel: isSuper ? 'Super Admin' : 'Admin' };
}

export function friendlyError(e: unknown) {
  const msg = e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : 'Something went wrong';
  if (/row-level security|permission denied/i.test(msg)) return 'You do not have permission to do that.';
  return msg;
}

export function blankItem(type: ItemType, categoryId = ''): ItemInsert {
  return {
    item_type: type, category_id: categoryId, name_en: '', name_am: '', name_om: '', description_en: '', description_am: '', description_om: '',
    ingredients: '', ingredients_am: '', ingredients_om: '', price: 0, discount_percent: 0, image_url: null, gallery: [], dietary_tags: [], allergens: [],
    status: 'available', is_featured: false, sort_order: 0, photo_confirmed: false, subcategory: null, prep_minutes: null, size: null,
  };
}
