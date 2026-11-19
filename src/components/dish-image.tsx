import { useState } from 'react';
import { useImage } from '@/lib/media';
import { ChefHat } from 'lucide-react';

export function DishImage({src,name,className=''}:{src:string|null;name:string;className?:string}) {
  const url=useImage(src);
  const [failed,setFailed]=useState(false);
  
  // Debug logging
  if (src && !url && !failed) {
    console.log('[DishImage] Resolving URL for:', { src, name });
  }
  
  if (failed) {
    console.error('[DishImage] Image failed to load:', { src, url, name });
  }
  
  // Show image if we have a URL and it didn't fail
  if (url && !failed) {
    return <img 
      src={url} 
      alt={name} 
      loading="lazy" 
      decoding="async" 
      onError={(e)=>{
        console.error('[DishImage] onError triggered:', url, e);
        setFailed(true);
      }} 
      className={`h-full w-full object-cover ${className}`}
    />;
  }
  
  // Show placeholder with name (for detail view) or chef hat (for cards)
  return <div className={`dish-placeholder flex h-full w-full flex-col items-center justify-center gap-4 px-5 text-center bg-gradient-to-br from-muted to-muted/50 ${className}`}>
    {name ? (
      <>
        <span aria-hidden="true" className="h-px w-8 bg-gold"/>
        <span className="font-display text-xl leading-snug sm:text-2xl">{name}</span>
        <span aria-hidden="true" className="h-px w-8 bg-gold"/>
      </>
    ) : (
      <ChefHat className="size-16 text-muted-foreground/30" />
    )}
  </div>;
}
