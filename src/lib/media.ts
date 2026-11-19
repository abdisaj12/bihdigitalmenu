import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const MEDIA_BUCKET = 'menu-images';
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const cache = new Map<string, { url: string; exp: number }>();

/** Stored image refs look like "menu-images/<path>"; plain https URLs pass through. */
export function storagePath(ref: string) { return ref.startsWith(`${MEDIA_BUCKET}/`) ? ref.slice(MEDIA_BUCKET.length + 1) : null; }

export async function resolveImage(ref: string | null): Promise<string | null> {
  if (!ref) return null;
  const path = storagePath(ref);
  if (!path) return ref;
  const hit = cache.get(path);
  if (hit && hit.exp > Date.now()) return hit.url;
  
  // Try getting public URL first (since bucket is public)
  const { data: publicData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  if (publicData?.publicUrl) {
    cache.set(path, { url: publicData.publicUrl, exp: Date.now() + 60 * 60 * 24 * 1000 }); // Cache for 24h
    return publicData.publicUrl;
  }
  
  // Fallback to signed URL if public URL doesn't work
  const { data, error } = await supabase.storage.from(MEDIA_BUCKET).createSignedUrl(path, 60 * 60 * 6);
  if (error || !data) return null;
  cache.set(path, { url: data.signedUrl, exp: Date.now() + 60 * 60 * 5 * 1000 });
  return data.signedUrl;
}

export function useImage(ref: string | null) {
  const [url, setUrl] = useState<string | null>(() => (ref && !storagePath(ref) ? ref : null));
  useEffect(() => { 
    let live = true; 
    if (ref) {
      resolveImage(ref).then((u) => {
        if (live) {
          if (!u) console.warn('[useImage] Failed to resolve:', ref);
          setUrl(u);
        }
      }).catch(err => {
        console.error('[useImage] Error resolving image:', ref, err);
        if (live) setUrl(null);
      });
    }
    return () => { live = false; }; 
  }, [ref]);
  return url;
}

export function validateImage(file: File) {
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Use a JPG, PNG or WebP image.';
  if (file.size > MAX_UPLOAD_BYTES * 3) return 'Images must be under 15 MB.';
  return null;
}

/** Resize to max 1600px and re-encode as WebP to keep menus fast on 4G. */
export async function optimizeImage(file: File, max = 1600): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('Could not process image'))), 'image/webp', 0.82));
}

export async function uploadImage(file: File, folder = 'library'): Promise<string> {
  const problem = validateImage(file); if (problem) throw new Error(problem);
  const blob = await optimizeImage(file);
  if (blob.size > MAX_UPLOAD_BYTES) throw new Error('Image is still too large after optimisation.');
  const path = `${folder}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, blob, { contentType: 'image/webp' });
  if (error) throw error;
  return `${MEDIA_BUCKET}/${path}`;
}
