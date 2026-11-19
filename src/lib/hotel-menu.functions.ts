import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export const readHotelMenu = createServerFn({method:'GET'}).handler(async () => {
  const key=process.env['SUPABASE_PUBLISHABLE_KEY'];
  const url=process.env['SUPABASE_URL'];
  if(!key || !url) throw new Error('The menu is temporarily unavailable. Please try again.');
  const client=createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const headers=new Headers(init?.headers);if(key.startsWith('sb_')&&headers.get('Authorization')===`Bearer ${key}`)headers.delete('Authorization');headers.set('apikey',key);return fetch(input,{...init,headers});}}});
  const [items,categories,settings]=await Promise.all([client.from('menu_items').select('*').order('sort_order'),client.from('categories').select('*').eq('is_visible',true).order('sort_order'),client.from('settings').select('*').eq('id',true).maybeSingle()]);
  if(items.error||categories.error||settings.error) throw new Error('The menu is temporarily unavailable. Please try again.');
  return {items:items.data??[],categories:categories.data??[],settings:settings.data};
});
