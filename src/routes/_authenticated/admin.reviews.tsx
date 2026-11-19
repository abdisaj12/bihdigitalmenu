import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Star, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/reviews")({
  head: () => ({ meta: [
    {"title": "Reviews — Bulcha International Hotel"},
    {"name": "description", "content": "Bulcha staff workspace for reviews."},
    {"property": "og:title", "content": "Reviews — Bulcha International Hotel"},
    {"property": "og:description", "content": "Bulcha staff workspace for reviews."},
    {"property": "og:type", "content": "website"},
    {"name": "twitter:card", "content": "summary_large_image"},
  ] }),
  component: ReviewsAdmin,
});

type Review = {
  id: string;
  food_id: string;
  rating: number;
  comment: string | null;
  customer_name: string | null;
  created_at: string;
  food_name?: string;
};

function Stars({ n }: { n: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < n ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

function ReviewsAdmin() {
  const [rows, setRows] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("id, food_id, rating, comment, customer_name, created_at, foods(name)")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) toast.error(error.message);
    const flat: Review[] = ((data as unknown as (Review & { foods?: { name: string } | null })[]) ?? []).map(
      (r) => ({ ...r, food_name: r.foods?.name ?? "—" }),
    );
    setRows(flat);
    setLoading(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete this review?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Review deleted");
    setRows((r) => r.filter((x) => x.id !== id));
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) =>
      (r.customer_name ?? "").toLowerCase().includes(needle) ||
      (r.food_name ?? "").toLowerCase().includes(needle) ||
      (r.comment ?? "").toLowerCase().includes(needle),
    );
  }, [rows, q]);

  const avg = rows.length ? (rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(2) : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
        <p className="text-sm text-muted-foreground">Customer feedback across menu items.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Total reviews</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{rows.length}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Average rating</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{avg}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">5-star</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{rows.filter((r) => r.rating === 5).length}</CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>All reviews</CardTitle>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-64" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No reviews.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.customer_name ?? "Anonymous"}</TableCell>
                    <TableCell>{r.food_name}</TableCell>
                    <TableCell><Stars n={r.rating} /></TableCell>
                    <TableCell className="max-w-[320px] truncate text-sm text-muted-foreground">
                      {r.comment ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => remove(r.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
