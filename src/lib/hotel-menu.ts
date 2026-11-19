import { queryOptions } from '@tanstack/react-query';
import { readHotelMenu } from './hotel-menu.functions';
import type { Database } from '@/integrations/supabase/types';
export type Dish = Database['public']['Tables']['menu_items']['Row'];
export type MenuCategory = Database['public']['Tables']['categories']['Row'];
export type HotelSettings = Database['public']['Tables']['settings']['Row'];
export type HotelOrder = Database['public']['Tables']['orders']['Row'];
export const defaultSettings: HotelSettings = { id:true,hotel_name:'Bulcha International Hotel',logo_url:null,vat_percent:15,currency:'ETB',opening_hours:'',wifi_name:'',wifi_password:'',phone:'',languages:['en','am','om'],default_language:'en',prices_include_vat:false };
export const hotelMenuOptions = queryOptions({queryKey:['hotel-menu'],staleTime:30000,queryFn:async()=>{const data=await readHotelMenu();return {...data,settings:data.settings??defaultSettings};}});
export function totals(amount:number, rate:number=15, pricesIncludeVat=false) {
  if(pricesIncludeVat){const total=Math.round(amount*100)/100;const vat=Math.round(amount*rate/(100+rate)*100)/100;return {subtotal:Math.round((total-vat)*100)/100,vat,total};}
  const vat=Math.round(amount*rate)/100; return {subtotal:amount,vat,total:Math.round((amount+vat)*100)/100};
}
export function effectivePrice(price:number, discountPercent:number=0) { return Math.round(price*(100-Math.min(90,Math.max(0,discountPercent)))) / 100; }
export function canPublish(image:string|null,confirmed:boolean) { return Boolean(image?.trim())&&confirmed; }
export function translated(dish:Dish,field:'name'|'description'|'ingredients',language:string) { if(field==='ingredients')return language==='am'?dish.ingredients_am||dish.ingredients:language==='om'?dish.ingredients_om||dish.ingredients:dish.ingredients; if(language==='am')return dish[`${field}_am`]||dish[`${field}_en`];if(language==='om')return dish[`${field}_om`]||dish[`${field}_en`];return dish[`${field}_en`]; }
export type OrderLine = {id:string;name:string;price:number;quantity:number;note?:string;image_url?:string|null};
export function orderLines(items:HotelOrder['items']):OrderLine[] {if(!Array.isArray(items))return [];return items.filter((i):i is {[key:string]:import('@/integrations/supabase/types').Json|undefined}=>i!==null&&typeof i==='object'&&!Array.isArray(i)).map(i=>({id:String(i.id),name:String(i.name),price:Number(i.price),quantity:Number(i.quantity),note:String(i.note??'')}));}
