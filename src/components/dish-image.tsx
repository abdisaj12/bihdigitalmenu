import { useState } from 'react';
import { useImage } from '@/lib/media';
export function DishImage({src,name,className=''}:{src:string|null;name:string;className?:string}) {
  const url=useImage(src);
  const [failed,setFailed]=useState(false);
  
  // Debug logging
  if (src && !url) {
    console.log('[DishImage] Waiting for URL resolution:', { src, name });
  }
  
  if (failed) {
    console.error('[DishImage] Image failed to load:', { src, url, name });
  }
  
  return url&&!failed?<img src={url} alt={name} loading="lazy" decoding="async" onError={(e)=>{console.error('[DishImage] onError triggered:', url, e);setFailed(true)}} className={`h-full w-full object-cover ${className}`}/>:<div className={`dish-placeholder flex h-full w-full flex-col items-center justify-center gap-4 px-5 text-center ${className}`}><span aria-hidden="true" className="h-px w-8 bg-gold"/><span className="font-display text-xl leading-snug sm:text-2xl">{name}</span><span aria-hidden="true" className="h-px w-8 bg-gold"/></div>;
}
