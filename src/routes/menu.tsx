import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { GuestMenuPremium } from '@/components/guest-menu-premium';
import { hotelMenuOptions } from '@/lib/hotel-menu';
const qr=z.union([z.string(),z.number()]).optional();
export const Route=createFileRoute('/menu')({validateSearch:z.object({table:qr,room:qr}),loader:({context})=>context.queryClient.ensureQueryData(hotelMenuOptions),head:()=>({meta:[{title:'Dining Menu — Bulcha International Hotel'},{name:'description',content:'Browse Ethiopian and international dishes and order at your table or room in Bulcha International Hotel, Hawassa.'},{property:'og:title',content:'Dining Menu — Bulcha International Hotel'},{property:'og:description',content:'Ethiopian traditions and international favourites, served at your table.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),pendingComponent:()=> <div className="p-10 text-center text-muted-foreground">Preparing your menu…</div>,component:MenuPage});
function MenuPage(){const {table,room}=Route.useSearch();return <GuestMenuPremium table={table===undefined?undefined:String(table)} room={room===undefined?undefined:String(room)}/>;}
export { GuestMenuPremium as MenuExperience };
