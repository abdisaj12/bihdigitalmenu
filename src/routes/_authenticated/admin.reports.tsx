import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ETB } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  head: () => ({ meta: [
    {"title": "Reports — Bulcha International Hotel"},
    {"name": "description", "content": "Bulcha staff workspace for reports."},
    {"property": "og:title", "content": "Reports — Bulcha International Hotel"},
    {"property": "og:description", "content": "Bulcha staff workspace for reports."},
    {"property": "og:type", "content": "website"},
    {"name": "twitter:card", "content": "summary_large_image"},
  ] }),
  component: ReportsAdmin,
});

type OrderRow = {
  id: string;
  order_number: string;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
  customer_name: string;
};

type ItemRow = { food_name: string; quantity: number; subtotal: number };

const RANGES = [
  { label: "Today", days: 1 },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

function ReportsAdmin() {
  const [range, setRange] = useState("7");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { void load(); }, [range]);

  async function load() {
    setLoading(true);
    const since = new Date(Date.now() - Number(range) * 86_400_000).toISOString();
    const [{ data: o, error: oe }, { data: i, error: ie }] = await Promise.all([
      supabase.from("orders").select("id, order_number, total, status, payment_status, created_at, customer_name")
        .gte("created_at", since).order("created_at", { ascending: false }).limit(500),
      supabase.from("order_items").select("food_name, quantity, subtotal, orders!inner(created_at)")
        .gte("orders.created_at", since).limit(2000),
    ]);
    if (oe) toast.error(oe.message);
    if (ie) toast.error(ie.message);
    setOrders((o as OrderRow[]) ?? []);
    setItems(((i as unknown as ItemRow[]) ?? []).map((r) => ({
      food_name: r.food_name, quantity: r.quantity, subtotal: Number(r.subtotal),
    })));
    setLoading(false);
  }

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.payment_status === "completed");
    const revenue = paid.reduce((s, o) => s + Number(o.total), 0);
    const aov = paid.length ? revenue / paid.length : 0;
    return {
      total: orders.length,
      paid: paid.length,
      pending: orders.filter((o) => o.payment_status === "pending" || o.payment_status === "verifying").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      revenue, aov,
    };
  }, [orders]);

  const topItems = useMemo(() => {
    const map = new Map<string, { qty: number; revenue: number }>();
    for (const i of items) {
      const e = map.get(i.food_name) ?? { qty: 0, revenue: 0 };
      e.qty += i.quantity; e.revenue += i.subtotal;
      map.set(i.food_name, e);
    }
    return [...map.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">Sales &amp; performance overview.</p>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {RANGES.map((r) => (<SelectItem key={r.days} value={String(r.days)}>{r.label}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Kpi label="Orders" value={String(stats.total)} />
            <Kpi label="Paid" value={String(stats.paid)} />
            <Kpi label="Pending" value={String(stats.pending)} />
            <Kpi label="Cancelled" value={String(stats.cancelled)} />
            <Kpi label="Revenue" value={ETB(stats.revenue)} />
            <Kpi label="Avg order" value={ETB(stats.aov)} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Top items</CardTitle></CardHeader>
              <CardContent>
                {topItems.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">No sales yet.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow><TableHead>Item</TableHead><TableHead>Qty</TableHead><TableHead className="text-right">Revenue</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {topItems.map((t) => (
                        <TableRow key={t.name}>
                          <TableCell className="font-medium">{t.name}</TableCell>
                          <TableCell>{t.qty}</TableCell>
                          <TableCell className="text-right">{ETB(t.revenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Recent orders</CardTitle></CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">No orders in range.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow><TableHead>#</TableHead><TableHead>Customer</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Total</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.slice(0, 10).map((o) => (
                        <TableRow key={o.id}>
                          <TableCell className="font-mono text-xs">{o.order_number}</TableCell>
                          <TableCell>{o.customer_name}</TableCell>
                          <TableCell className="text-xs capitalize text-muted-foreground">{o.status}</TableCell>
                          <TableCell className="text-right">{ETB(Number(o.total))}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle></CardHeader>
      <CardContent className="text-2xl font-bold">{value}</CardContent>
    </Card>
  );
}
