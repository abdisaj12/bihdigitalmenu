import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
export const adminHotelOptions=queryOptions({queryKey:['admin-hotel'],queryFn:async()=>{const [items,categories,orders,settings]=await Promise.all([supabase.from('menu_items').select('*').order('sort_order'),supabase.from('categories').select('*').order('sort_order'),supabase.from('orders').select('*').order('created_at',{ascending:false}),supabase.from('settings').select('*').eq('id',true).single()]);if(items.error||categories.error||orders.error||settings.error)throw new Error('Unable to load hotel management. Please try again.');return {items:items.data??[],categories:categories.data??[],orders:orders.data??[],settings:settings.data};}});
export const sections=['overview','menu','categories','orders','settings','qr'] as const;
export type AdminSection=typeof sections[number];
export function isAdminRole(roles:string[]){return roles.includes('admin');}
