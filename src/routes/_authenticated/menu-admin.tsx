import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, Plus, Pencil, Trash2, Copy, Archive, ArchiveRestore, Search,
  Image as ImageIcon, Star, Flame, Eye, History, Upload, X, Filter,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ETB } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/menu-admin")({
  head: () => ({ meta: [
    {"title": "Menu Management — Bulcha International Hotel"},
    {"name": "description", "content": "Bulcha staff workspace for menu management."},
    {"property": "og:title", "content": "Menu Management — Bulcha International Hotel"},
    {"property": "og:description", "content": "Bulcha staff workspace for menu management."},
    {"property": "og:type", "content": "website"},
    {"name": "twitter:card", "content": "summary_large_image"},
  ] }),
  component: MenuAdminPage,
});

type Category = "breakfast" | "lunch" | "dinner" | "drinks" | "desserts" | "special";
type Status = "available" | "out_of_stock" | "temporarily_unavailable" | "seasonal" | "discontinued";

type Food = {
  id: string;
  name: string;
  description: string | null;
  category: Category;
  price: number;
  discount_price: number | null;
  image_url: string | null;
  gallery_images: string[];
  ingredients: string | null;
  preparation_time: number | null;
  calories: number | null;
  available: boolean;
  status: Status;
  is_featured: boolean;
  is_best_seller: boolean;
  is_popular: boolean;
  is_recommended: boolean;
  is_vegetarian: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

type AuditEntry = {
  id: string;
  food_id: string | null;
  food_name: string | null;
  user_email: string | null;
  action: string;
  field: string | null;
  old_value: any;
  new_value: any;
  created_at: string;
};

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
  { id: "drinks", label: "Drinks" },
  { id: "desserts", label: "Desserts" },
  { id: "special", label: "Special Offers" },
];

const STATUSES: { id: Status; label: string; tone: string }[] = [
  { id: "available", label: "Available", tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" },
  { id: "out_of_stock", label: "Out of Stock", tone: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30" },
  { id: "temporarily_unavailable", label: "Temporarily Unavailable", tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30" },
  { id: "seasonal", label: "Seasonal", tone: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30" },
  { id: "discontinued", label: "Discontinued", tone: "bg-muted text-muted-foreground border-border" },
];

const statusInfo = (s: Status) => STATUSES.find((x) => x.id === s) ?? STATUSES[0];

function MenuAdminPage() {
  const { user, roles } = useAuth();
  const isAdmin = roles.includes("admin");

  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterFlag, setFilterFlag] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);

  const [editing, setEditing] = useState<Food | null>(null);
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<Food | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase.from("foods").select("*").order("created_at", { ascending: false });
      if (!active) return;
      if (error) toast.error(error.message);
      else setFoods(normalizeMany(data ?? []));
      setLoading(false);
    })();
    const ch = supabase
      .channel("foods-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "foods" }, (payload) => {
        setFoods((prev) => {
          if (payload.eventType === "INSERT") return [normalize(payload.new), ...prev.filter((f) => f.id !== (payload.new as any).id)];
          if (payload.eventType === "UPDATE") return prev.map((f) => (f.id === (payload.new as any).id ? normalize(payload.new) : f));
          if (payload.eventType === "DELETE") return prev.filter((f) => f.id !== (payload.old as any).id);
          return prev;
        });
      })
      .subscribe();
    return () => { active = false; supabase.removeChannel(ch); };
  }, []);

  const filtered = useMemo(() => {
    return foods.filter((f) => {
      if (showArchived ? !f.archived_at : !!f.archived_at) return false;
      if (search && !`${f.name} ${f.description ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCat !== "all" && f.category !== filterCat) return false;
      if (filterStatus !== "all" && f.status !== filterStatus) return false;
      if (filterFlag === "featured" && !f.is_featured) return false;
      if (filterFlag === "best_seller" && !f.is_best_seller) return false;
      if (filterFlag === "recent") {
        const week = Date.now() - 7 * 24 * 3600 * 1000;
        if (new Date(f.created_at).getTime() < week) return false;
      }
      return true;
    });
  }, [foods, search, filterCat, filterStatus, filterFlag, showArchived]);

  const stats = useMemo(() => {
    const active = foods.filter((f) => !f.archived_at);
    const available = active.filter((f) => f.status === "available");
    return {
      total: active.length,
      available: available.length,
      out: active.filter((f) => f.status === "out_of_stock").length,
      featured: active.filter((f) => f.is_featured).length,
      bestseller: active.filter((f) => f.is_best_seller).length,
      avg: active.length ? active.reduce((s, f) => s + Number(f.price), 0) / active.length : 0,
    };
  }, [foods]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Admin access required</h2>
            <p className="text-sm text-muted-foreground mb-4">You need the admin role to manage the menu.</p>
            <Button asChild><Link to="/dashboard">Back to dashboard</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
            </Button>
            <div>
              <h1 className="font-display text-xl font-bold">Menu Management</h1>
              <p className="text-xs text-muted-foreground">Add, edit, price, and publish menu items</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setAuditOpen(true)}>
              <History className="h-4 w-4" /> Audit log
            </Button>
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> New item
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Stat label="Total items" value={stats.total} />
          <Stat label="Available" value={stats.available} tone="text-emerald-600" />
          <Stat label="Out of stock" value={stats.out} tone="text-red-600" />
          <Stat label="Featured" value={stats.featured} tone="text-amber-600" />
          <Stat label="Best sellers" value={stats.bestseller} tone="text-purple-600" />
          <Stat label="Avg. price" value={ETB(stats.avg)} />
        </section>

        <Card>
          <CardContent className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or description…" className="pl-9" />
            </div>
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="w-[170px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterFlag} onValueChange={setFilterFlag}>
              <SelectTrigger className="w-[170px]"><SelectValue placeholder="Flags" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All items</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="best_seller">Best sellers</SelectItem>
                <SelectItem value="recent">Recently added</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 px-2">
              <Switch checked={showArchived} onCheckedChange={setShowArchived} id="show-archived" />
              <Label htmlFor="show-archived" className="text-sm">Show archived</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Loading…</TableCell></TableRow>
                )}
                {!loading && filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No items match these filters.</TableCell></TableRow>
                )}
                {filtered.map((f) => (
                  <TableRow key={f.id} className={f.archived_at ? "opacity-60" : ""}>
                    <TableCell>
                      {f.image_url ? (
                        <img src={f.image_url} alt={f.name} className="h-12 w-12 rounded-md object-cover border" />
                      ) : (
                        <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center border">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{f.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1 max-w-[280px]">{f.description}</div>
                    </TableCell>
                    <TableCell className="capitalize text-sm">{f.category}</TableCell>
                    <TableCell>
                      <div className="font-medium">{ETB(Number(f.price))}</div>
                      {f.discount_price != null && (
                        <div className="text-xs text-emerald-600">→ {ETB(Number(f.discount_price))}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusInfo(f.status).tone}>{statusInfo(f.status).label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {f.is_featured && <Badge variant="outline" className="bg-amber-500/15 text-amber-700 border-amber-500/30"><Star className="h-3 w-3" /></Badge>}
                        {f.is_best_seller && <Badge variant="outline" className="bg-purple-500/15 text-purple-700 border-purple-500/30"><Flame className="h-3 w-3" /></Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setViewing(f)}><Eye className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setEditing(f)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => duplicateItem(f)}><Copy className="h-4 w-4" /></Button>
                        {f.archived_at ? (
                          <Button size="icon" variant="ghost" onClick={() => restoreItem(f, user?.email)}><ArchiveRestore className="h-4 w-4" /></Button>
                        ) : (
                          <Button size="icon" variant="ghost" onClick={() => archiveItem(f, user?.email)}><Archive className="h-4 w-4" /></Button>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => deleteItem(f, user?.email)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {(creating || editing) && (
        <ItemDialog
          item={editing ?? undefined}
          onClose={() => { setCreating(false); setEditing(null); }}
          userEmail={user?.email ?? null}
        />
      )}
      {viewing && <ViewDialog item={viewing} onClose={() => setViewing(null)} />}
      {auditOpen && <AuditDialog onClose={() => setAuditOpen(false)} />}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: any; tone?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`text-xl font-bold mt-1 ${tone ?? ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function normalize(row: any): Food {
  return {
    ...row,
    gallery_images: Array.isArray(row.gallery_images) ? row.gallery_images : [],
    price: Number(row.price),
    discount_price: row.discount_price != null ? Number(row.discount_price) : null,
  };
}
function normalizeMany(rows: any[]): Food[] { return rows.map(normalize); }

async function logAudit(entry: Partial<AuditEntry> & { action: string; food_id?: string | null; food_name?: string | null }, email: string | null | undefined) {
  await supabase.from("menu_audit_log").insert({
    food_id: entry.food_id ?? null,
    food_name: entry.food_name ?? null,
    user_email: email ?? null,
    action: entry.action,
    field: entry.field ?? null,
    old_value: entry.old_value ?? null,
    new_value: entry.new_value ?? null,
  });
}

async function duplicateItem(f: Food) {
  const { id, created_at, updated_at, archived_at, ...rest } = f;
  void id; void created_at; void updated_at; void archived_at;
  const { data, error } = await supabase.from("foods").insert({ ...rest, name: `${f.name} (copy)` }).select().single();
  if (error) return toast.error(error.message);
  toast.success("Item duplicated");
  await logAudit({ action: "duplicate", food_id: data.id, food_name: data.name }, (await supabase.auth.getUser()).data.user?.email);
}

async function archiveItem(f: Food, email: string | null | undefined) {
  const { error } = await supabase.from("foods").update({ archived_at: new Date().toISOString(), available: false }).eq("id", f.id);
  if (error) return toast.error(error.message);
  toast.success("Archived");
  await logAudit({ action: "archive", food_id: f.id, food_name: f.name }, email);
}

async function restoreItem(f: Food, email: string | null | undefined) {
  const { error } = await supabase.from("foods").update({ archived_at: null, available: true }).eq("id", f.id);
  if (error) return toast.error(error.message);
  toast.success("Restored");
  await logAudit({ action: "restore", food_id: f.id, food_name: f.name }, email);
}

async function deleteItem(f: Food, email: string | null | undefined) {
  if (!confirm(`Permanently delete "${f.name}"? This cannot be undone.`)) return;
  const { error } = await supabase.from("foods").delete().eq("id", f.id);
  if (error) {
    if (String(error.message).includes("foreign key")) {
      toast.error("Cannot delete: item is referenced by existing orders. Archive instead.");
    } else toast.error(error.message);
    return;
  }
  toast.success("Deleted");
  await logAudit({ action: "delete", food_id: null, food_name: f.name }, email);
}

function ItemDialog({ item, onClose, userEmail }: { item?: Food; onClose: () => void; userEmail: string | null }) {
  const isEdit = !!item;
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [category, setCategory] = useState<Category>(item?.category ?? "lunch");
  const [price, setPrice] = useState<string>(item ? String(item.price) : "");
  const [discountPrice, setDiscountPrice] = useState<string>(item?.discount_price != null ? String(item.discount_price) : "");
  const [ingredients, setIngredients] = useState(item?.ingredients ?? "");
  const [prepTime, setPrepTime] = useState<string>(item?.preparation_time != null ? String(item.preparation_time) : "");
  const [calories, setCalories] = useState<string>(item?.calories != null ? String(item.calories) : "");
  const [status, setStatus] = useState<Status>(item?.status ?? "available");
  const [isFeatured, setIsFeatured] = useState(item?.is_featured ?? false);
  const [isBestSeller, setIsBestSeller] = useState(item?.is_best_seller ?? false);
  const [isVegetarian, setIsVegetarian] = useState(item?.is_vegetarian ?? false);
  const [imageUrl, setImageUrl] = useState(item?.image_url ?? "");
  const [gallery, setGallery] = useState<string[]>(item?.gallery_images ?? []);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const mainFileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: FileList, target: "main" | "gallery") => {
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("food-images").upload(path, file, { upsert: false });
        if (error) throw error;
        const { data } = supabase.storage.from("food-images").createSignedUrl
          ? await supabase.storage.from("food-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10)
          : { data: null } as any;
        const url = data?.signedUrl ?? supabase.storage.from("food-images").getPublicUrl(path).data.publicUrl;
        urls.push(url);
      }
      if (target === "main") setImageUrl(urls[0]);
      else setGallery((g) => [...g, ...urls]);
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!name.trim()) return toast.error("Name is required");
    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum < 0) return toast.error("Valid price required");
    const dpNum = discountPrice ? Number(discountPrice) : null;
    if (dpNum != null && (!Number.isFinite(dpNum) || dpNum < 0 || dpNum >= priceNum)) {
      return toast.error("Discount must be lower than price");
    }
    setSaving(true);
    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      category,
      price: priceNum,
      discount_price: dpNum,
      ingredients: ingredients.trim() || null,
      preparation_time: prepTime ? Number(prepTime) : null,
      calories: calories ? Number(calories) : null,
      status,
      available: status === "available",
      is_featured: isFeatured,
      is_best_seller: isBestSeller,
      is_vegetarian: isVegetarian,
      image_url: imageUrl || null,
      gallery_images: gallery,
    };
    if (isEdit && item) {
      const { error } = await supabase.from("foods").update(payload).eq("id", item.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
      // Log notable field changes
      const changes: Array<{ field: string; oldV: any; newV: any }> = [];
      if (item.price !== priceNum) changes.push({ field: "price", oldV: item.price, newV: priceNum });
      if ((item.discount_price ?? null) !== dpNum) changes.push({ field: "discount_price", oldV: item.discount_price, newV: dpNum });
      if (item.status !== status) changes.push({ field: "status", oldV: item.status, newV: status });
      if ((item.image_url ?? null) !== (imageUrl || null)) changes.push({ field: "image_url", oldV: item.image_url, newV: imageUrl });
      if (changes.length === 0) {
        await logAudit({ action: "update", food_id: item.id, food_name: name }, userEmail);
      } else {
        for (const c of changes) {
          await logAudit({ action: "update", food_id: item.id, food_name: name, field: c.field, old_value: c.oldV, new_value: c.newV }, userEmail);
        }
      }
      toast.success("Item updated");
    } else {
      const { data, error } = await supabase.from("foods").insert(payload).select().single();
      if (error) { toast.error(error.message); setSaving(false); return; }
      await logAudit({ action: "create", food_id: data.id, food_name: data.name, new_value: payload }, userEmail);
      toast.success("Item created");
    }
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit menu item" : "New menu item"}</DialogTitle>
          <DialogDescription>{isEdit ? "Update item details. Changes go live instantly." : "Add a new item to the menu."}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Main image</Label>
            <div className="mt-1 flex items-center gap-3">
              {imageUrl ? (
                <div className="relative">
                  <img src={imageUrl} alt="" className="h-24 w-24 rounded-md object-cover border" />
                  <button type="button" onClick={() => setImageUrl("")} className="absolute -top-2 -right-2 bg-background border rounded-full p-0.5 shadow-sm">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="h-24 w-24 rounded-md border-2 border-dashed flex items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-6 w-6" />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <input ref={mainFileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files && uploadFiles(e.target.files, "main")} />
                <Button type="button" variant="outline" size="sm" onClick={() => mainFileRef.current?.click()} disabled={uploading}>
                  <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload image"}
                </Button>
                <Input placeholder="…or paste image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="text-xs" />
              </div>
            </div>
          </div>

          <div>
            <Label>Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Wagyu Burger" />
          </div>
          <div>
            <Label>Category *</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Short, appetising description…" />
          </div>

          <div>
            <Label>Price (ETB) *</Label>
            <Input type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div>
            <Label>Discount price (ETB)</Label>
            <Input type="number" min={0} step="0.01" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} placeholder="Optional" />
          </div>

          <div>
            <Label>Prep time (minutes)</Label>
            <Input type="number" min={0} value={prepTime} onChange={(e) => setPrepTime(e.target.value)} />
          </div>
          <div>
            <Label>Calories</Label>
            <Input type="number" min={0} value={calories} onChange={(e) => setCalories(e.target.value)} />
          </div>

          <div className="md:col-span-2">
            <Label>Ingredients</Label>
            <Textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} rows={2} placeholder="Comma-separated…" />
          </div>

          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3 items-end">
            <div className="flex flex-col items-start gap-1">
              <Label className="text-xs">Featured</Label>
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
            </div>
            <div className="flex flex-col items-start gap-1">
              <Label className="text-xs">Best seller</Label>
              <Switch checked={isBestSeller} onCheckedChange={setIsBestSeller} />
            </div>
            <div className="flex flex-col items-start gap-1">
              <Label className="text-xs">Vegetarian</Label>
              <Switch checked={isVegetarian} onCheckedChange={setIsVegetarian} />
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between">
              <Label>Gallery images</Label>
              <input ref={galleryFileRef} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && uploadFiles(e.target.files, "gallery")} />
              <Button type="button" variant="outline" size="sm" onClick={() => galleryFileRef.current?.click()} disabled={uploading}>
                <Upload className="h-4 w-4" /> Add photos
              </Button>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {gallery.map((g, i) => (
                <div key={i} className="relative">
                  <img src={g} alt="" className="h-20 w-full rounded-md object-cover border" />
                  <button type="button" onClick={() => setGallery((prev) => prev.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-background border rounded-full p-0.5 shadow-sm">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {gallery.length === 0 && <p className="text-xs text-muted-foreground col-span-4">No gallery images yet.</p>}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={submit} disabled={saving || uploading}>{saving ? "Saving…" : isEdit ? "Save changes" : "Create item"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ViewDialog({ item, onClose }: { item: Food; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
          <DialogDescription className="capitalize">{item.category} · {statusInfo(item.status).label}</DialogDescription>
        </DialogHeader>
        {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-56 rounded-md object-cover border" />}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Info label="Price" value={ETB(Number(item.price))} />
          <Info label="Discount" value={item.discount_price != null ? ETB(Number(item.discount_price)) : "—"} />
          <Info label="Prep time" value={item.preparation_time ? `${item.preparation_time} min` : "—"} />
          <Info label="Calories" value={item.calories != null ? `${item.calories} kcal` : "—"} />
          <Info label="Featured" value={item.is_featured ? "Yes" : "No"} />
          <Info label="Best seller" value={item.is_best_seller ? "Yes" : "No"} />
        </div>
        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
        {item.ingredients && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Ingredients</p>
            <p className="text-sm">{item.ingredients}</p>
          </div>
        )}
        {item.gallery_images?.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {item.gallery_images.map((g, i) => <img key={i} src={g} alt="" className="h-20 w-full rounded-md object-cover border" />)}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="border rounded-md p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function AuditDialog({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("menu_audit_log").select("*").order("created_at", { ascending: false }).limit(200)
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        else setRows((data as AuditEntry[]) ?? []);
        setLoading(false);
      });
  }, []);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle><History className="h-4 w-4 inline mr-2" /> Menu audit log</DialogTitle>
          <DialogDescription>Last 200 changes across the menu.</DialogDescription>
        </DialogHeader>
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Who</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No entries yet.</TableCell></TableRow>}
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</TableCell>
                  <TableCell className="text-xs">{r.user_email ?? "—"}</TableCell>
                  <TableCell className="text-xs">{r.food_name ?? "—"}</TableCell>
                  <TableCell className="text-xs capitalize">{r.action}</TableCell>
                  <TableCell className="text-xs">
                    {r.field ? (
                      <span><b>{r.field}</b>: {String(r.old_value ?? "—")} → {String(r.new_value ?? "—")}</span>
                    ) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
