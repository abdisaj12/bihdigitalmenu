import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Crown, LogOut, ChefHat, ConciergeBell, ShieldCheck, Coins, Utensils, BedDouble, Plus, Pencil, Trash2, QrCode, Receipt, UtensilsCrossed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ETB } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [
    {"title": "Orders Dashboard — Bulcha International Hotel"},
    {"name": "description", "content": "Bulcha staff workspace for orders dashboard."},
    {"property": "og:title", "content": "Orders Dashboard — Bulcha International Hotel"},
    {"property": "og:description", "content": "Bulcha staff workspace for orders dashboard."},
    {"property": "og:type", "content": "website"},
    {"name": "twitter:card", "content": "summary_large_image"},
  ] }),
  component: Dashboard,
});

type Tab = "kitchen" | "waiter" | "cashier" | "admin";

type Status = "pending" | "accepted" | "preparing" | "ready" | "delivered" | "cancelled";

type Order = {
  id: string; order_number: string; customer_name: string; status: Status;
  total: number; created_at: string; room_service: boolean; payment_status: string;
  table_id: string | null;
};

function Dashboard() {
  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const isAdmin = roles.includes("admin");
  const isKitchen = roles.includes("kitchen") || isAdmin;
  const isWaiter = roles.includes("waiter") || isAdmin;
  const isCashier = roles.includes("cashier") || isAdmin;

  const defaultTab: Tab = isKitchen ? "kitchen" : isWaiter ? "waiter" : isCashier ? "cashier" : "admin";
  const [tab, setTab] = useState<Tab>(defaultTab);

  useEffect(() => { setTab(defaultTab); }, [defaultTab]);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/auth" });
  };

  const tabs: { id: Tab; label: string; icon: any; enabled: boolean }[] = [
    { id: "kitchen", label: "Kitchen", icon: ChefHat, enabled: isKitchen },
    { id: "waiter", label: "Waiter", icon: ConciergeBell, enabled: isWaiter },
    { id: "cashier", label: "Cashier", icon: Coins, enabled: isCashier },
    { id: "admin", label: "Admin", icon: ShieldCheck, enabled: isAdmin },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-gold shadow-gold">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-base font-bold">Bulcha Dashboard</p>
              <p className="text-[11px] text-muted-foreground">{user?.email} · {roles.join(", ") || "no role"}</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/menu-admin" className="inline-flex items-center gap-1.5 rounded-full glass px-4 py-2 text-xs font-medium shadow-soft hover:shadow-elegant">
              <UtensilsCrossed className="h-3.5 w-3.5" /> Menu
            </Link>
            <Link to="/payments" className="inline-flex items-center gap-1.5 rounded-full glass px-4 py-2 text-xs font-medium shadow-soft hover:shadow-elegant">
              <Receipt className="h-3.5 w-3.5" /> Payments
            </Link>
            <Link to="/qr-codes" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-gold hover:shadow-elegant">
              <QrCode className="h-3.5 w-3.5" /> QR Codes
            </Link>
            <button onClick={handleSignOut} className="inline-flex items-center gap-1.5 rounded-full glass px-4 py-2 text-xs font-medium shadow-soft hover:shadow-elegant">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.filter((t) => t.enabled).map((t) => (
              <button
                key={t.id} onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-smooth ${
                  tab === t.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
            {roles.length === 0 && (
              <p className="px-4 py-3 text-sm text-muted-foreground">
                No staff role assigned yet. An admin must grant your account a role.
              </p>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {tab === "kitchen" && <KitchenBoard />}
        {tab === "waiter" && <WaiterPanel />}
        {tab === "cashier" && <CashierPanel />}
        {tab === "admin" && <AdminPanel />}
      </main>
    </div>
  );
}

function useLiveOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200)
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        setOrders((data as Order[]) ?? []);
      });
    const ch = supabase
      .channel("orders-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        setOrders((prev) => {
          if (payload.eventType === "INSERT") return [payload.new as Order, ...prev];
          if (payload.eventType === "UPDATE") return prev.map((o) => o.id === (payload.new as Order).id ? payload.new as Order : o);
          if (payload.eventType === "DELETE") return prev.filter((o) => o.id !== (payload.old as Order).id);
          return prev;
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
  return { orders, setOrders };
}

async function setStatus(id: string, status: Status) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) toast.error(error.message);
  else toast.success(`Status → ${status}`);
}

const COLS: { id: Status; label: string; tone: string }[] = [
  { id: "pending", label: "New Orders", tone: "bg-amber-500/10 border-amber-500/20" },
  { id: "preparing", label: "Preparing", tone: "bg-blue-500/10 border-blue-500/20" },
  { id: "ready", label: "Ready", tone: "bg-emerald-500/10 border-emerald-500/20" },
  { id: "delivered", label: "Delivered", tone: "bg-muted border-border" },
];

function KitchenBoard() {
  const { orders } = useLiveOrders();
  const grouped = useMemo(() => {
    const g: Record<Status, Order[]> = { pending: [], accepted: [], preparing: [], ready: [], delivered: [], cancelled: [] };
    for (const o of orders) {
      if (o.status === "accepted") g.pending.push(o);
      else g[o.status]?.push(o);
    }
    return g;
  }, [orders]);

  const next: Record<Status, Status | null> = {
    pending: "preparing", accepted: "preparing", preparing: "ready", ready: "delivered", delivered: null, cancelled: null,
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Kitchen Board</h2>
      <p className="text-sm text-muted-foreground">Live orders update in real time.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLS.map((c) => (
          <div key={c.id} className={`rounded-2xl border p-4 ${c.tone}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold">{c.label}</h3>
              <span className="rounded-full bg-background px-2 py-0.5 text-xs font-bold">{grouped[c.id].length}</span>
            </div>
            <div className="mt-3 space-y-3">
              {grouped[c.id].map((o) => (
                <OrderCard key={o.id} order={o} onAdvance={next[c.id] ? () => setStatus(o.id, next[c.id]!) : undefined} advanceLabel={
                  c.id === "pending" ? "Start preparing" : c.id === "preparing" ? "Mark ready" : c.id === "ready" ? "Mark delivered" : undefined
                } />
              ))}
              {grouped[c.id].length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">No orders</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderCard({ order, onAdvance, advanceLabel }: { order: Order; onAdvance?: () => void; advanceLabel?: string }) {
  const [items, setItems] = useState<{ id: string; food_name: string; quantity: number }[]>([]);
  useEffect(() => {
    supabase.from("order_items").select("id, food_name, quantity").eq("order_id", order.id)
      .then(({ data }) => setItems(data ?? []));
  }, [order.id]);
  const mins = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000);
  return (
    <div className="rounded-xl bg-background p-3 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm font-bold">{order.order_number}</p>
        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
          {order.room_service ? <BedDouble className="h-3 w-3" /> : <Utensils className="h-3 w-3" />} {mins}m
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{order.customer_name} · {ETB(order.total)}</p>
      <ul className="mt-2 space-y-0.5 text-xs">
        {items.map((it) => (
          <li key={it.id}><span className="font-semibold">{it.quantity}×</span> {it.food_name}</li>
        ))}
      </ul>
      {onAdvance && (
        <button onClick={onAdvance} className="mt-3 w-full rounded-full bg-primary py-1.5 text-xs font-semibold text-primary-foreground hover:shadow-gold">
          {advanceLabel}
        </button>
      )}
    </div>
  );
}

function WaiterPanel() {
  const { orders } = useLiveOrders();
  const [tables, setTables] = useState<{ id: string; table_number: string; is_room: boolean; status: string }[]>([]);
  useEffect(() => {
    supabase.from("tables").select("id, table_number, is_room, status").order("table_number")
      .then(({ data }) => setTables(data ?? []));
  }, []);
  const active = orders.filter((o) => ["pending", "accepted", "preparing", "ready"].includes(o.status));
  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-2xl font-bold">Active Tables & Rooms</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {tables.map((t) => {
            const has = orders.some((o) => o.table_id === t.id && o.status !== "delivered" && o.status !== "cancelled");
            return (
              <div key={t.id} className={`rounded-xl border p-4 text-center ${has ? "border-primary bg-primary/5" : "bg-card"}`}>
                <div className="flex justify-center text-2xl">{t.is_room ? "🛏️" : "🍽️"}</div>
                <p className="mt-1 font-display text-sm font-bold">{t.is_room ? `Room ${t.table_number}` : `Table ${t.table_number}`}</p>
                <p className="text-[10px] text-muted-foreground">{has ? "Active" : "Free"}</p>
              </div>
            );
          })}
        </div>
      </section>
      <section>
        <h2 className="font-display text-2xl font-bold">Active Orders</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr><th className="px-4 py-3 text-left">Order</th><th className="px-4 py-3 text-left">Customer</th><th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3 text-right">Action</th></tr>
            </thead>
            <tbody>
              {active.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="px-4 py-3 font-display font-semibold">{o.order_number}</td>
                  <td className="px-4 py-3">{o.customer_name}</td>
                  <td className="px-4 py-3 text-xs">{o.room_service ? "Room Service" : "Dine-in"}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-muted px-2 py-1 text-xs">{o.status}</span></td>
                  <td className="px-4 py-3 text-right font-display font-bold">{ETB(o.total)}</td>
                  <td className="px-4 py-3 text-right">
                    {o.status === "ready" && (
                      <button onClick={() => setStatus(o.id, "delivered")} className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Deliver</button>
                    )}
                  </td>
                </tr>
              ))}
              {active.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No active orders</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function CashierPanel() {
  const { orders } = useLiveOrders();
  const toBill = orders.filter((o) => o.status === "delivered" && o.payment_status !== "completed");
  const settle = async (id: string) => {
    await supabase.from("orders").update({ payment_status: "completed" }).eq("id", id);
    await supabase.from("payments").update({ status: "completed" }).eq("order_id", id);
    toast.success("Payment settled");
  };
  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Pending Payments</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {toBill.map((o) => (
          <div key={o.id} className="rounded-2xl bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="font-display text-lg font-bold">{o.order_number}</p>
              <span className="text-xs text-muted-foreground">{o.payment_status}</span>
            </div>
            <p className="text-sm text-muted-foreground">{o.customer_name}</p>
            <p className="mt-2 font-display text-2xl font-bold">{ETB(o.total)}</p>
            <button onClick={() => settle(o.id)} className="mt-4 w-full rounded-full bg-primary py-2 text-sm font-semibold text-primary-foreground hover:shadow-gold">
              Mark Paid
            </button>
          </div>
        ))}
        {toBill.length === 0 && <p className="text-muted-foreground">All settled. </p>}
      </div>
    </div>
  );
}

type Food = {
  id: string; name: string; description: string | null; price: number;
  category: string; subcategory: string | null; available: boolean;
};
function AdminPanel() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [stats, setStats] = useState({ revenue: 0, orders: 0, customers: 0 });

  const load = async () => {
    const { data } = await supabase.from("foods").select("id, name, description, price, category, subcategory, available").order("subcategory");
    setFoods(data ?? []);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const { data: o } = await supabase.from("orders").select("total, customer_name").gte("created_at", today.toISOString());
    const revenue = (o ?? []).reduce((s, x) => s + Number(x.total), 0);
    setStats({ revenue, orders: o?.length ?? 0, customers: new Set((o ?? []).map((x) => x.customer_name)).size });
  };
  useEffect(() => { load(); }, []);

  const toggle = async (f: Food) => {
    await supabase.from("foods").update({ available: !f.available }).eq("id", f.id);
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("foods").delete().eq("id", id);
    if (error) toast.error(error.message); else load();
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Today's Revenue" value={ETB(stats.revenue)} />
        <StatCard label="Today's Orders" value={stats.orders.toString()} />
        <StatCard label="Unique Customers" value={stats.customers.toString()} />
      </section>
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Menu Items ({foods.length})</h2>
        </div>
        <div className="mt-4 overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Category</th><th className="px-4 py-3 text-right">Price</th><th className="px-4 py-3 text-center">Available</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {foods.map((f) => (
                <tr key={f.id} className="border-t">
                  <td className="px-4 py-3 font-semibold">{f.name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{f.subcategory}</td>
                  <td className="px-4 py-3 text-right font-display font-bold">{ETB(f.price)}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggle(f)} className={`rounded-full px-2 py-1 text-xs ${f.available ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                      {f.available ? "On" : "Off"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(f.id)} className="rounded-full p-1.5 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-soft">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}
