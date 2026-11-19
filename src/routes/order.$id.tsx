import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Crown, CheckCircle2, Clock, ChefHat, Bell, PackageCheck, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ETB } from "@/lib/format";

export const Route = createFileRoute("/order/$id")({
  head: () => ({ meta: [
    {"title": "Track Your Order — Bulcha International Hotel"},
    {"name": "description", "content": "Follow the live status of your Bulcha dining order."},
    {"property": "og:title", "content": "Track Your Order — Bulcha International Hotel"},
    {"property": "og:description", "content": "Follow the live status of your Bulcha dining order."},
    {"property": "og:type", "content": "website"},
    {"name": "twitter:card", "content": "summary_large_image"},
  ] }),
  component: OrderTrackPage,
});

type Status = "pending" | "accepted" | "preparing" | "ready" | "delivered" | "cancelled";

type Order = {
  id: string; order_number: string; customer_name: string; status: Status;
  subtotal: number; tax: number; total: number; created_at: string;
  payment_status: string; room_service: boolean;
};
type Item = { id: string; food_name: string; quantity: number; subtotal: number };

const STEPS: { id: Status; label: string; icon: any }[] = [
  { id: "pending", label: "Order Received", icon: Clock },
  { id: "accepted", label: "Accepted", icon: CheckCircle2 },
  { id: "preparing", label: "Preparing", icon: ChefHat },
  { id: "ready", label: "Ready", icon: Bell },
  { id: "delivered", label: "Delivered", icon: PackageCheck },
];

function OrderTrackPage() {
  const { id } = useParams({ from: "/order/$id" });
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: o } = await supabase.rpc("get_order_summary", { p_id: id }).maybeSingle();
      setOrder(o as Order);
      const { data: it } = await supabase.rpc("get_order_items", { p_id: id });
      setItems((it as Item[]) ?? []);
    };
    load();
    const ch = supabase
      .channel(`order-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` }, (p) => {
        setOrder((prev) => ({ ...(prev as Order), ...(p.new as Order) }));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id]);

  if (!order) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  }

  const stepIdx = STEPS.findIndex((s) => s.id === order.status);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="glass border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link to="/menu" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to menu
          </Link>
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-[color:var(--gold)]" />
            <span className="font-display text-sm font-bold">Bulcha International Hotel</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-3xl gradient-hero p-8 text-primary-foreground shadow-elegant">
          <p className="text-xs uppercase tracking-widest text-primary-foreground/60">Order Number</p>
          <h1 className="mt-1 font-display text-3xl font-bold gradient-text-gold">{order.order_number}</h1>
          <p className="mt-2 text-primary-foreground/80">Thank you {order.customer_name} — we're on it.</p>
          {order.room_service && <p className="mt-1 text-xs text-primary-foreground/60">Room Service Order</p>}
        </div>

        {/* Status timeline */}
        <div className="mt-8 rounded-2xl bg-card p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Live Status</h2>
          <div className="mt-6 space-y-4">
            {STEPS.map((s, i) => {
              const done = stepIdx >= i;
              const active = stepIdx === i;
              return (
                <div key={s.id} className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-smooth ${
                      done ? "bg-primary text-primary-foreground shadow-elegant" : "bg-muted text-muted-foreground"
                    } ${active ? "animate-pulse-glow" : ""}`}
                  >
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
                  </div>
                  {done && <CheckCircle2 className="h-5 w-5 text-accent" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Items */}
        <div className="mt-6 rounded-2xl bg-card p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Items</h2>
          <ul className="mt-4 space-y-3">
            {items.map((it) => (
              <li key={it.id} className="flex justify-between text-sm">
                <span><span className="font-semibold">{it.quantity}×</span> {it.food_name}</span>
                <span className="font-display font-bold">{ETB(it.subtotal)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1.5 border-t pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{ETB(order.subtotal)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Service & VAT</span><span>{ETB(order.tax)}</span></div>
            <div className="flex justify-between border-t pt-2 font-display text-lg font-bold"><span>Total</span><span>{ETB(order.total)}</span></div>
            <p className="pt-1 text-xs text-muted-foreground">Payment: <span className="font-semibold">{order.payment_status}</span></p>
          </div>
        </div>
      </main>
    </div>
  );
}
