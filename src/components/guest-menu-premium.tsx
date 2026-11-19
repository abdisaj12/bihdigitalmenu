import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Search, ShoppingBag, ArrowRight, MapPin, Trash2, Check, UtensilsCrossed, Heart, Star } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import { hotelMenuOptions, translated, totals, effectivePrice, type Dish } from '@/lib/hotel-menu';
import { useCart } from '@/lib/cart-store';
import { supabase } from '@/integrations/supabase/client';
import { ETB } from '@/lib/format';
import { HotelIdentity } from './hotel-layout';
import { DishImage } from './dish-image';
import { PlatePresentation } from './plate-presentation';
import { QuantityStepper } from './quantity-stepper';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from './ui/sheet';
import { ThemeToggle } from './theme-toggle';

// Premium Components
import { DietaryFilter, type DietaryFilters } from './premium/dietary-filter';
import { CallWaiter } from './premium/call-waiter';
import { DishBadges } from './premium/dish-badges';
import { DishRating } from './premium/dish-rating';
import { LoyaltyDisplay } from './premium/loyalty-display';
import { CurrentTime } from './premium/current-time';
import { AmazingDishCard } from './premium/amazing-dish-card';
import { StunningMenuHero } from './premium/stunning-menu-hero';

export function GuestMenuPremium({table,room}:{table?:string;room?:string}){
 const {data}=useSuspenseQuery(hotelMenuOptions);const {items,categories,settings}=data;
 const cart=useCart();const reduced=useReducedMotion();const bag=useRef<HTMLButtonElement>(null);
 
 const [language,setLanguage]=useState(settings.default_language);
 const [category,setCategory]=useState('all');
 const [search,setSearch]=useState('');
 const [dietaryFilters, setDietaryFilters] = useState<DietaryFilters>({});
 const [selected,setSelected]=useState<Dish|null>(null);
 const [qty,setQty]=useState(1);
 const [itemNote,setItemNote]=useState('');
 const [open,setOpen]=useState(false);
 const [place,setPlace]=useState(room?`Room ${room}`:table?`Table ${table}`:'');
 const [note,setNote]=useState('');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [success,setSuccess]=useState('');
 const [favorites, setFavorites] = useState<Set<string>>(new Set());
 const [loyaltyPoints, setLoyaltyPoints] = useState(0);
 const submission=useRef<{id:string;number:string}|null>(null);
 
 const amount=totals(cart.subtotal,settings.vat_percent,settings.prices_include_vat);

 // Enhanced filtering with dietary preferences
 const visible = items.filter(i => {
   if (!i.is_available) return false;
   if (!categories.some(c=>c.id===i.category_id&&c.is_visible)) return false;
   if (category !== 'all' && i.category_id !== category) return false;
   
   // Search filter
   const searchText = `${translated(i,'name',language)} ${i.name_en} ${translated(i,'description',language)}`.toLowerCase();
   if (search && !searchText.includes(search.toLowerCase())) return false;
   
   // Dietary filters - Fixed logic
   if (dietaryFilters.vegetarian && !i.dietary_tags.includes('vegetarian')) return false;
   if (dietaryFilters.vegan && !i.dietary_tags.includes('vegan')) return false;
   if (dietaryFilters.glutenFree && !i.dietary_tags.includes('gluten_free')) return false;
   if (dietaryFilters.halal && !i.dietary_tags.includes('halal')) return false;
   // Spice level filter - only filter if a level is selected
   if (dietaryFilters.spiceLevel) {
     const hasSpiceTag = i.dietary_tags.some(tag => tag.startsWith('spice_'));
     if (hasSpiceTag && !i.dietary_tags.includes(`spice_${dietaryFilters.spiceLevel}`)) {
       return false;
     }
   }
   
   return true;
 });

 // Sort items: featured and popular first
 const sortedItems = [...visible].sort((a, b) => {
   if (a.is_featured && !b.is_featured) return -1;
   if (!a.is_featured && b.is_featured) return 1;
   return 0;
 });

 useEffect(()=>{
   if(table||room) setPlace(room?`Room ${room}`:`Table ${table}`);
   
   // Load user favorites and loyalty points
   const loadUserData = async () => {
     const { data: { user } } = await supabase.auth.getUser();
     if (user) {
       // Load favorites
       const { data: favs } = await supabase
         .from('guest_favorites')
         .select('menu_item_id')
         .eq('guest_id', user.id);
       if (favs) {
         setFavorites(new Set(favs.map(f => f.menu_item_id)));
       }
       
       // Load loyalty points
       const { data: profile } = await supabase
         .from('profiles')
         .select('loyalty_points')
         .eq('id', user.id)
         .single();
       if (profile) {
         setLoyaltyPoints(profile.loyalty_points || 0);
       }
     }
   };
   
   loadUserData();
 },[table,room]);

 const toggleFavorite = async (itemId: string) => {
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) {
     toast.error('Please log in to save favorites');
     return;
   }

   const isFavorite = favorites.has(itemId);
   
   if (isFavorite) {
     await supabase
       .from('guest_favorites')
       .delete()
       .eq('guest_id', user.id)
       .eq('menu_item_id', itemId);
     setFavorites(prev => {
       const next = new Set(prev);
       next.delete(itemId);
       return next;
     });
     toast.success('Removed from favorites');
   } else {
     await supabase
       .from('guest_favorites')
       .insert({ guest_id: user.id, menu_item_id: itemId });
     setFavorites(prev => new Set(prev).add(itemId));
     toast.success('Added to favorites');
   }
 };

 function view(item:Dish){setSelected(item);setQty(1);setItemNote('');}
 
 function add(item:Dish,event:React.MouseEvent<HTMLButtonElement>,quantity=1){
  cart.add({id:item.id,name:translated(item,'name',language),price:effectivePrice(item.price,item.discount_percent),image_url:item.image_url,subcategory:null},quantity,itemNote);
  setSelected(null);
  toast.success(`${translated(item,'name',language)} added to your order`);
  
  if(!reduced&&item.image_url?.startsWith('http')&&bag.current){
    const rect=event.currentTarget.getBoundingClientRect();
    const target=bag.current.getBoundingClientRect();
    const img=document.createElement('img');
    img.src=item.image_url;
    img.alt='';
    img.className='flying-dish';
    document.body.appendChild(img);
    const animation=img.animate([
      {transform:`translate(${rect.x}px,${rect.y}px) scale(1)`,opacity:1},
      {transform:`translate(${target.x}px,${target.y}px) scale(.25)`,opacity:0}
    ],{duration:650,easing:'cubic-bezier(.2,.7,.3,1)'});
    animation.onfinish=()=>img.remove();
  }
  bag.current?.animate(reduced?[{opacity:1},{opacity:1}]:[{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:350});
 }
 
 async function order(event:FormEvent){
   event.preventDefault();
   if(!cart.count||busy)return;
   setBusy(true);
   setError('');
   
   try{
     if(!place.trim())throw new Error('Please enter your table or room number.');
     if(!submission.current){
       const id=crypto.randomUUID();
       submission.current={id,number:`BU-${id.slice(0,8).toUpperCase()}`};
     }
     const {id,number}=submission.current;
     const result=await supabase.from('orders').insert({
       id,
       submission_id:id,
       order_number:number,
       customer_name:'Hotel guest',
       table_or_room:place.trim(),
       room_service:place.toLowerCase().startsWith('room'),
       items:cart.lines.map(l=>({id:l.food.id,quantity:l.qty,note:l.note??''})),
       subtotal:amount.subtotal,
       vat:amount.vat,
       tax:amount.vat,
       total:amount.total,
       status:'new',
       note:note.trim()
     });
     
     if(result.error&&result.error.code!=='23505')throw result.error;
     setSuccess(number);
     cart.clear();
     setOpen(false);
     submission.current=null;
   }catch(e){
     setError(e instanceof Error?e.message:'Could not send your order. Please try again; your items are still here.');
   }finally{
     setBusy(false);
   }
 }

 return <div className="min-h-svh bg-background pb-24 text-foreground">
  <header className="sticky top-0 z-30 glass shadow-soft border-b border-[#D84315]/20">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-5 py-4 sm:px-8">
      <HotelIdentity/>
      <div className="flex items-center gap-1 sm:gap-3">
        <select 
          aria-label="Menu language" 
          className="h-11 w-24 rounded-lg border border-[#D84315]/30 bg-card/50 px-2 text-xs font-medium transition-all hover:border-[#D84315]/60 focus:border-[#D84315] focus:ring-2 focus:ring-[#D84315]/20" 
          value={language} 
          onChange={e=>setLanguage(e.target.value)}
        >
          <option value="en">🇺🇸 EN</option>
          <option value="am">🇪🇹 አማ</option>
        </select>
        <ThemeToggle/>
        <Button 
          ref={bag} 
          className="h-11 px-3 bg-[#D84315] hover:bg-[#BF360C] text-white" 
          aria-label={`Open order, ${cart.count} items`} 
          onClick={()=>setOpen(true)}
        >
          <ShoppingBag/>
          <span aria-live="polite">{cart.count}</span>
        </Button>
      </div>
    </div>
  </header>

  <main className="mx-auto max-w-7xl px-5 sm:px-8">
   {/* Stunning Dynamic Hero with Food Images */}
   <StunningMenuHero dishCount={sortedItems.length} currentCategory={category} />

   {/* Loyalty Display (if user has points) */}
   {loyaltyPoints > 0 && (
     <div className="py-6">
       <LoyaltyDisplay points={loyaltyPoints} ordersCount={0} />
     </div>
   )}

   {/* Professional Search & Time */}
   <section className="py-8 border-b">
     <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
       <div className="relative w-full sm:flex-1 max-w-xl">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground"/>
         <Input 
           aria-label="Search menu" 
           className="h-14 pl-12 pr-4 rounded-xl bg-background border-border text-lg"
           placeholder="Search dishes, ingredients..." 
           value={search} 
           onChange={e=>setSearch(e.target.value)}
         />
       </div>
       <div className="flex items-center gap-4">
         <DietaryFilter filters={dietaryFilters} onChange={setDietaryFilters} />
         <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
           <CurrentTime />
         </div>
       </div>
     </div>
   </section>

   {/* Elegant Category Navigation */}
   <nav aria-label="Menu categories" className="py-8 overflow-x-auto">
     <div className="flex gap-3">
       <button
         className={`shrink-0 px-6 py-3 rounded-full font-medium transition-all ${
           category === 'all'
             ? 'bg-[#D84315] text-white shadow-lg shadow-[#D84315]/30'
             : 'bg-card border border-border text-foreground hover:border-[#D84315]/50 hover:bg-[#D84315]/5'
         }`}
         onClick={() => setCategory('all')}
       >
         All Menu
       </button>
       {categories.map((c) => (
         <button
           key={c.id}
           className={`shrink-0 px-6 py-3 rounded-full font-medium transition-all ${
             category === c.id
               ? 'bg-[#D84315] text-white shadow-lg shadow-[#D84315]/30'
               : 'bg-card border border-border text-foreground hover:border-[#D84315]/50 hover:bg-[#D84315]/5'
           }`}
           onClick={() => setCategory(c.id)}
         >
           {language === 'am' ? c.name_am || c.name_en : c.name_en}
         </button>
       ))}
     </div>
   </nav>

   {/* Results Info */}
   <div className="flex items-center justify-between py-4 text-sm">
     <span className="font-medium text-foreground">
       {sortedItems.length} {sortedItems.length === 1 ? 'dish' : 'dishes'} available
     </span>
     <span className="text-muted-foreground">
       Prices {settings.prices_include_vat ? 'include' : 'exclude'} {settings.vat_percent}% VAT
     </span>
   </div>

   {/* Amazing Cards with Circular Plates */}
   {sortedItems.length ? (
     <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-12">
       {sortedItems.map(item=>(
         <AmazingDishCard
           key={item.id}
           id={item.id}
           name={translated(item,'name',language)}
           description={translated(item,'description',language)}
           price={effectivePrice(item.price,item.discount_percent)}
           imageUrl={item.image_url}
           isFeatured={item.is_featured}
           isPopular={item.is_featured}
           isFavorite={favorites.has(item.id)}
           rating={4.5}
           reviewCount={12}
           isVegetarian={item.dietary_tags.includes('vegetarian')}
           onView={() => view(item)}
           onFavorite={() => toggleFavorite(item.id)}
           onAddToCart={() => view(item)}
         />
       ))}
     </div>
   ) : (
     <div className="py-20 text-center">
       <UtensilsCrossed className="mx-auto mb-4 text-gold"/>
       <h2 className="text-2xl">{items.length?'No dishes found':'The menu is being prepared'}</h2>
       <p className="mt-3 text-sm text-muted-foreground">
         {items.length?'Try a different name or category.':'Please check back shortly or ask our hotel team.'}
       </p>
       {items.length>0&&<Button variant="link" onClick={()=>{setSearch('');setCategory('all');setDietaryFilters({});}}>Clear filters</Button>}
     </div>
   )}

   <footer className="mt-16 py-8 border-t">
     <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
       <div>
         <p className="font-display text-lg font-semibold">{settings.hotel_name}</p>
         <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
           <MapPin className="size-3.5"/>
           Hawassa, Ethiopia
         </p>
       </div>
       <Button asChild variant="ghost" size="sm">
         <Link to="/admin/login">
           Staff Login <ArrowRight className="ml-2 size-4"/>
         </Link>
       </Button>
     </div>
   </footer>
  </main>

  {/* Call Waiter FAB */}
  {place && <CallWaiter tableOrRoom={place} />}

  {/* Floating Cart Button */}
  {cart.count>0&&!open&&(
    <div className="fixed inset-x-5 bottom-5 z-30 mx-auto max-w-md">
      <Button 
        className="h-16 w-full justify-between rounded-3xl px-6 bg-[#D84315] hover:bg-[#BF360C] text-white shadow-elegant transition-all duration-300 text-base backdrop-blur-sm" 
        onClick={()=>setOpen(true)}
      >
        <span className="flex items-center gap-3">
          <ShoppingBag className="size-5"/>
          {cart.count} · View order
        </span>
        <span className="font-display text-lg">{ETB(amount.total)}</span>
      </Button>
    </div>
  )}

  {/* Dish Detail Dialog */}
  <Dialog open={!!selected} onOpenChange={v=>{if(!v)setSelected(null);}}>
    <DialogContent className="dish-detail max-h-[94svh] max-w-2xl overflow-y-auto p-0 rounded-3xl" aria-describedby="dish-description">
      {selected&&(
        <motion.div 
          initial={reduced?false:{y:30}} 
          animate={{y:0}} 
          transition={{type:'spring',stiffness:170,damping:25}}
        >
          <div className="relative aspect-[16/9] overflow-hidden">
            <DishImage src={selected.image_url} name={translated(selected,'name',language)}/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Favorite in detail view */}
            <button
              onClick={() => toggleFavorite(selected.id)}
              className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-sm flex items-center justify-center shadow-lg"
            >
              <Heart 
                className={`size-6 ${favorites.has(selected.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
              />
            </button>
          </div>
          
          <div className="space-y-6 p-8">
            <div>
              <DialogTitle className="font-display text-4xl leading-tight mb-3">
                {translated(selected,'name',language)}
              </DialogTitle>
              <DishRating rating={4.5} reviewCount={12} size="md" />
            </div>

            {/* Premium Badges */}
            <DishBadges
              isChefSpecial={selected.is_featured}
              isPopular={selected.is_featured}
              isVegetarian={selected.dietary_tags.includes('vegetarian')}
              isVegan={selected.dietary_tags.includes('vegan')}
              isGlutenFree={selected.dietary_tags.includes('gluten_free')}
              spiceLevel="medium"
              carbonFootprint={1.2}
            />

            <DialogDescription id="dish-description" className="text-base leading-7">
              {translated(selected,'description',language)}
            </DialogDescription>

            <div className="rounded-2xl border border-border bg-card/50 p-5">
              <h3 className="text-base font-medium mb-2">Ingredients</h3>
              <p className="text-sm leading-6 text-muted-foreground">
                {translated(selected,'ingredients',language)||'Please ask our team for ingredient details.'}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card/50 p-5">
              <h3 className="text-base font-medium mb-2">Allergens</h3>
              <p className="text-sm text-muted-foreground">
                {selected.allergens.join(', ')||'Please ask our team about allergies before ordering.'}
              </p>
            </div>

            <div className="flex items-center justify-between py-2">
              <Label className="text-base">Quantity</Label>
              <QuantityStepper value={qty} onChange={setQty} label={selected.name_en}/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dish-note" className="text-base">Note (optional)</Label>
              <Textarea 
                id="dish-note" 
                placeholder="No onions, please" 
                maxLength={500} 
                className="rounded-2xl" 
                value={itemNote} 
                onChange={e=>setItemNote(e.target.value)}
              />
            </div>

            <Button 
              variant="champagne" 
              className="h-16 w-full rounded-2xl text-base shadow-gold" 
              onClick={e=>add(selected,e,qty)}
            >
              Add to order · <span className="ml-2 font-display text-lg">{ETB(effectivePrice(selected.price,selected.discount_percent)*qty)}</span>
            </Button>
          </div>
        </motion.div>
      )}
    </DialogContent>
  </Dialog>

  {/* Cart Sheet */}
  <Sheet open={open} onOpenChange={setOpen}>
    <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
      <div className="border-b p-6">
        <SheetTitle className="font-display text-2xl">Your order</SheetTitle>
        <SheetDescription>{cart.count?`${cart.count} items at your table`:'A little something delicious?'}</SheetDescription>
      </div>
      
      {!cart.count?(
        <div className="flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center">
          <ShoppingBag className="size-10 text-gold"/>
          <h2 className="text-2xl">Your order is empty</h2>
          <Button variant="champagne" onClick={()=>setOpen(false)}>Browse the menu</Button>
        </div>
      ):(
        <form onSubmit={order} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto p-6">
            {cart.lines.map(l=>(
              <div key={l.food.id} className="flex gap-3 border-b pb-5">
                <div className="size-20 shrink-0 overflow-hidden rounded-xl">
                  <DishImage src={l.food.image_url} name={l.food.name}/>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg">{l.food.name}</p>
                  <p className="mb-2 text-xs text-muted-foreground">{ETB(l.food.price)}{l.note&&` · ${l.note}`}</p>
                  <div className="flex items-center justify-between gap-1">
                    <QuantityStepper 
                      value={l.qty} 
                      label={l.food.name} 
                      onChange={v=>{submission.current=null;cart.update(l.food.id,v-l.qty);}}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="size-11 text-muted-foreground" 
                      aria-label={`Remove ${l.food.name}`} 
                      onClick={()=>{submission.current=null;cart.update(l.food.id,-l.qty);}}
                    >
                      <Trash2/>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="space-y-2">
              <Label htmlFor="table-room">Table or room number</Label>
              <Input 
                id="table-room" 
                required 
                maxLength={80} 
                placeholder="Table 12 or Room 204" 
                className="h-12" 
                value={place} 
                onChange={e=>setPlace(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="order-note">Order note (optional)</Label>
              <Textarea 
                id="order-note" 
                maxLength={1000} 
                placeholder="Anything else we should know?" 
                value={note} 
                onChange={e=>setNote(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-3 border-t bg-card p-6">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{ETB(amount.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>VAT ({settings.vat_percent}%)</span>
              <span>{ETB(amount.vat)}</span>
            </div>
            {loyaltyPoints >= 100 && (
              <div className="flex justify-between text-sm text-[#D84315] font-medium">
                <span>You'll earn</span>
                <span>+{Math.floor(amount.total / 10)} points</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-3 font-display text-xl">
              <span>Total</span>
              <span>{ETB(amount.total)}</span>
            </div>
            {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button 
              type="submit" 
              variant="champagne" 
              disabled={busy} 
              className="h-14 w-full rounded-xl"
            >
              {busy?'Sending your order…':`Place Order · ${ETB(amount.total)}`}
            </Button>
          </div>
        </form>
      )}
    </SheetContent>
  </Sheet>

  {/* Success Dialog */}
  <Dialog open={!!success} onOpenChange={v=>{if(!v)setSuccess('');}}>
    <DialogContent className="flex h-svh max-w-none flex-col items-center justify-center border-0 text-center">
      <motion.div 
        initial={reduced?false:{scale:.8,opacity:0}} 
        animate={{scale:1,opacity:1}} 
        transition={{type:'spring',damping:20}} 
        className="grid size-24 place-items-center rounded-full border border-gold"
      >
        <Check className="size-12 text-gold"/>
      </motion.div>
      <DialogTitle className="mt-6 font-display text-4xl">Thank you.</DialogTitle>
      <DialogDescription className="text-base">Your order has been received.</DialogDescription>
      <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">Order {success}</p>
      <p className="mt-2 text-sm text-muted-foreground">Estimated time: 30 minutes</p>
      {loyaltyPoints >= 0 && (
        <p className="mt-2 text-sm text-[#D84315] font-medium">
          +{Math.floor(amount.total / 10)} loyalty points earned!
        </p>
      )}
      <Button variant="champagne" className="mt-8 h-12" onClick={()=>setSuccess('')}>
        Back to menu <ArrowRight/>
      </Button>
    </DialogContent>
  </Dialog>
 </div>
}
