import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/admin/coupons")({
  head: () => ({ meta: [
    {"title": "Coupons — Bulcha International Hotel"},
    {"name": "description", "content": "Bulcha staff workspace for coupons."},
    {"property": "og:title", "content": "Coupons — Bulcha International Hotel"},
    {"property": "og:description", "content": "Bulcha staff workspace for coupons."},
    {"property": "og:type", "content": "website"},
    {"name": "twitter:card", "content": "summary_large_image"},
  ] }),
  component: CouponsAdmin,
});

type Coupon = {
  id: string;
  code: string;
  discount_percent: number | null;
  discount_amount: number | null;
  valid_from: string;
  valid_until: string | null;
  usage_limit: number | null;
  times_used: number;
  active: boolean;
  created_at: string;
};

const schema = z.object({
  code: z.string().trim().min(2).max(32),
  discount_percent: z.number().min(0).max(100).nullable(),
  discount_amount: z.number().min(0).nullable(),
  valid_until: z.string().nullable(),
  usage_limit: z.number().int().min(1).nullable(),
  active: z.boolean(),
});

type Draft = {
  id?: string;
  code: string;
  discount_percent: string;
  discount_amount: string;
  valid_until: string;
  usage_limit: string;
  active: boolean;
};

const emptyDraft: Draft = {
  code: "", discount_percent: "", discount_amount: "", valid_until: "", usage_limit: "", active: true,
};

function CouponsAdmin() {
  const [rows, setRows] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as Coupon[]) ?? []);
    setLoading(false);
  }

  function openNew() { setDraft(emptyDraft); setOpen(true); }
  function openEdit(c: Coupon) {
    setDraft({
      id: c.id,
      code: c.code,
      discount_percent: c.discount_percent?.toString() ?? "",
      discount_amount: c.discount_amount?.toString() ?? "",
      valid_until: c.valid_until ? c.valid_until.slice(0, 10) : "",
      usage_limit: c.usage_limit?.toString() ?? "",
      active: c.active,
    });
    setOpen(true);
  }

  async function save() {
    const parsed = schema.safeParse({
      code: draft.code.trim().toUpperCase(),
      discount_percent: draft.discount_percent ? Number(draft.discount_percent) : null,
      discount_amount: draft.discount_amount ? Number(draft.discount_amount) : null,
      valid_until: draft.valid_until || null,
      usage_limit: draft.usage_limit ? Number(draft.usage_limit) : null,
      active: draft.active,
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
    if (parsed.data.discount_percent == null && parsed.data.discount_amount == null) {
      return toast.error("Set either a percent or a fixed amount");
    }
    setSaving(true);
    const payload = { ...parsed.data, valid_until: parsed.data.valid_until ? new Date(parsed.data.valid_until).toISOString() : null };
    const q = draft.id
      ? supabase.from("coupons").update(payload).eq("id", draft.id)
      : supabase.from("coupons").insert(payload);
    const { error } = await q;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(draft.id ? "Coupon updated" : "Coupon created");
    setOpen(false);
    void load();
  }

  async function toggleActive(c: Coupon) {
    const { error } = await supabase.from("coupons").update({ active: !c.active }).eq("id", c.id);
    if (error) return toast.error(error.message);
    setRows((r) => r.map((x) => (x.id === c.id ? { ...x, active: !c.active } : x)));
  }

  async function remove(id: string) {
    if (!confirm("Delete this coupon?")) return;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setRows((r) => r.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
          <p className="text-sm text-muted-foreground">Manage promo codes and discounts.</p>
        </div>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> New coupon</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>All coupons</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : rows.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No coupons yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Valid until</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-medium">{c.code}</TableCell>
                    <TableCell>
                      {c.discount_percent != null ? `${c.discount_percent}%` : `ETB ${c.discount_amount}`}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.valid_until ? new Date(c.valid_until).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {c.times_used}{c.usage_limit ? ` / ${c.usage_limit}` : ""}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={c.active} onCheckedChange={() => toggleActive(c)} />
                        <Badge variant={c.active ? "default" : "secondary"}>{c.active ? "Active" : "Inactive"}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{draft.id ? "Edit coupon" : "New coupon"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Code</Label>
              <Input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} placeholder="SUMMER10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Discount %</Label>
                <Input type="number" value={draft.discount_percent}
                  onChange={(e) => setDraft({ ...draft, discount_percent: e.target.value, discount_amount: "" })} />
              </div>
              <div className="grid gap-2">
                <Label>Fixed amount (ETB)</Label>
                <Input type="number" value={draft.discount_amount}
                  onChange={(e) => setDraft({ ...draft, discount_amount: e.target.value, discount_percent: "" })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Valid until</Label>
                <Input type="date" value={draft.valid_until}
                  onChange={(e) => setDraft({ ...draft, valid_until: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Usage limit</Label>
                <Input type="number" value={draft.usage_limit}
                  onChange={(e) => setDraft({ ...draft, usage_limit: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={draft.active} onCheckedChange={(v) => setDraft({ ...draft, active: v })} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
