import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Trash2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { DishImage } from '@/components/dish-image';
import { listMedia, useUploader, UploadProgress, type MediaFile } from '@/components/admin/media-picker';
import { PageHeader, EmptyState } from '@/components/admin/page-parts';
import { MEDIA_BUCKET, storagePath } from '@/lib/media';
import { friendlyError, useCatalog } from '@/lib/admin-catalog';
export const Route = createFileRoute('/_authenticated/admin/media')({
  head: () => ({ meta: [{ title: 'Media Library — Bulcha Admin' }, { name: 'description', content: 'Upload and manage menu photos.' }, { property: 'og:title', content: 'Media Library — Bulcha Admin' }, { property: 'og:description', content: 'Upload and manage menu photos.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: Media,
});
function Media() {
  const [files, setFiles] = useState<MediaFile[] | null>(null);
  const { data } = useCatalog();
  const load = () => listMedia().then(setFiles).catch((e) => { toast.error(friendlyError(e)); setFiles([]); });
  useEffect(() => { load(); }, []);
  const { upload, progress } = useUploader(() => load());
  const usedBy = (ref: string) => data?.items.filter((i) => i.image_url === ref || i.gallery.includes(ref)).map((i) => i.name_en) ?? [];
  async function remove(f: MediaFile) {
    const used = usedBy(f.ref);
    if (used.length) { toast.error(`In use by ${used.join(', ')}. Replace it there first.`); return; }
    if (!confirm('Delete this image?')) return;
    const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([storagePath(f.ref)!]);
    if (error) toast.error(friendlyError(error)); else { toast.success('Image deleted'); load(); }
  }
  return <div className="space-y-5">
    <PageHeader title="Media Library" subtitle={files ? `${files.length} images` : 'Loading…'} actions={<Button asChild><label className="cursor-pointer"><Upload />Upload images<input type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => e.target.files && upload(e.target.files)} /></label></Button>} />
    <UploadProgress progress={progress} />
    {files && files.length === 0 ? <EmptyState title="No images yet" body="Uploads are resized and converted to WebP automatically." /> :
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{(files ?? []).map((f) => <div key={f.ref} className="overflow-hidden rounded-xl border bg-card"><div className="aspect-square"><DishImage src={f.ref} name="" /></div><div className="flex items-center justify-between gap-2 p-2 text-xs"><span className="truncate text-muted-foreground">{usedBy(f.ref)[0] ?? 'Unused'} · {Math.round(f.size / 1024)} KB</span><Button size="icon" variant="ghost" aria-label="Delete image" onClick={() => remove(f)}><Trash2 /></Button></div></div>)}</div>}
  </div>;
}
