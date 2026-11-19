import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Upload, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DishImage } from '@/components/dish-image';
import { MEDIA_BUCKET, uploadImage } from '@/lib/media';
import { friendlyError } from '@/lib/admin-catalog';

export type MediaFile = { ref: string; name: string; size: number; created: string };
export async function listMedia(): Promise<MediaFile[]> {
  const { data, error } = await supabase.storage.from(MEDIA_BUCKET).list('library', { limit: 500, sortBy: { column: 'created_at', order: 'desc' } });
  if (error) throw error;
  return (data ?? []).filter((f) => f.id).map((f) => ({ ref: `${MEDIA_BUCKET}/library/${f.name}`, name: f.name, size: Number(f.metadata?.size ?? 0), created: f.created_at ?? '' }));
}

export function useUploader(onDone: (refs: string[]) => void) {
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  async function upload(files: FileList | File[]) {
    const list = [...files]; if (!list.length) return;
    setProgress({ done: 0, total: list.length }); const refs: string[] = [];
    for (const f of list) {
      try { refs.push(await uploadImage(f)); } catch (e) { toast.error(`${f.name}: ${friendlyError(e)}`); }
      setProgress((p) => p && { ...p, done: p.done + 1 });
    }
    setProgress(null); if (refs.length) { toast.success(`${refs.length} image(s) uploaded`); onDone(refs); }
  }
  return { upload, progress };
}

export function UploadProgress({ progress }: { progress: { done: number; total: number } | null }) {
  if (!progress) return null;
  return <div className="space-y-1"><Progress value={(progress.done / progress.total) * 100} /><p className="text-xs text-muted-foreground">Uploading {progress.done} of {progress.total}…</p></div>;
}

export function MediaPicker({ open, onClose, onPick, multiple = false }: { open: boolean; onClose: () => void; onPick: (refs: string[]) => void; multiple?: boolean }) {
  const [files, setFiles] = useState<MediaFile[] | null>(null);
  const [chosen, setChosen] = useState<string[]>([]);
  const load = () => listMedia().then(setFiles).catch((e) => { toast.error(friendlyError(e)); setFiles([]); });
  useEffect(() => { if (open) { setChosen([]); load(); } }, [open]);
  const { upload, progress } = useUploader((refs) => { load(); setChosen((c) => (multiple ? [...c, ...refs] : refs.slice(0, 1))); });
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="admin-console max-h-[90svh] max-w-3xl overflow-y-auto">
        <DialogHeader><DialogTitle>Media library</DialogTitle><DialogDescription>Choose {multiple ? 'images' : 'an image'} or upload new ones (JPG, PNG, WebP).</DialogDescription></DialogHeader>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed p-5 text-sm text-muted-foreground hover:bg-muted"><Upload className="size-4" />Upload images<input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => e.target.files && upload(e.target.files)} /></label>
        <UploadProgress progress={progress} />
        {files === null ? <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p> : files.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No images yet. Upload the first one above.</p> :
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">{files.map((f) => { const on = chosen.includes(f.ref); return (
            <button type="button" key={f.ref} onClick={() => setChosen(multiple ? (on ? chosen.filter((c) => c !== f.ref) : [...chosen, f.ref]) : [f.ref])} className={`relative aspect-square overflow-hidden rounded-lg border-2 ${on ? 'border-primary' : 'border-transparent'}`} aria-pressed={on} aria-label={f.name}>
              <DishImage src={f.ref} name="" />{on && <span className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-4" /></span>}
            </button>); })}</div>}
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={!chosen.length} onClick={() => { onPick(chosen); onClose(); }}>Use {chosen.length || ''} selected</Button></div>
      </DialogContent>
    </Dialog>
  );
}
