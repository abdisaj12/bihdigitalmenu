import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Crown, Copy, Upload, CheckCircle2, Clock, XCircle, ChevronLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ETB } from "@/lib/format";

export const Route = createFileRoute("/pay/$id")({
  head: () => ({ meta: [
    {"title": "Complete Payment — Bulcha International Hotel"},
    {"name": "description", "content": "Choose your payment method and submit payment for your Bulcha order."},
    {"property": "og:title", "content": "Complete Payment — Bulcha International Hotel"},
    {"property": "og:description", "content": "Choose your payment method and submit payment for your Bulcha order."},
    {"property": "og:type", "content": "website"},
    {"name": "twitter:card", "content": "summary_large_image"},
  ] }),
  component: PayPage,
});

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  payment_status: string;
};


type PaymentMethod = {
  id: string;
  method: string;
  display_name: string;
  merchant_name: string;
  account_number: string;
  instructions: string | null;
  qr_image_url: string | null;
};

type Payment = {
  id: string;
  status: string;
  transaction_reference: string | null;
  rejection_reason: string | null;
};

function PayPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [reference, setReference] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: o }, { data: pm }, { data: pay }] = await Promise.all([
        supabase.rpc("get_order_summary", { p_id: id }).maybeSingle(),
        supabase.from("payment_methods").select("*").eq("is_active", true).order("display_order"),
        supabase.rpc("get_order_payment", { p_order_id: id }).maybeSingle(),
      ]);

      setOrder(o as Order | null);
      setMethods((pm ?? []) as PaymentMethod[]);
      setPayment(pay as Payment | null);
      if (pm && pm.length > 0) setSelected(pm[0] as PaymentMethod);
    })();

    const ch = supabase.channel(`pay-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "payments", filter: `order_id=eq.${id}` },
        (payload) => setPayment(payload.new as Payment))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id]);

  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied"); };

  const submit = async () => {
    if (!selected || !order) return;
    if (selected.method === "cash") {
      const { error } = await supabase.rpc("submit_payment", {
        p_order_id: order.id,
        p_method: "cash",
        p_transaction_reference: undefined,
        p_screenshot_url: undefined,
      });
      if (error) return toast.error(error.message);
      toast.success("Order saved. Please pay at the counter.");
      navigate({ to: "/order/$id", params: { id: order.id } });
      return;
    }
    if (!reference.trim() || reference.trim().length < 4)
      return toast.error("Please enter a valid transaction reference");
    setBusy(true);
    try {
      let screenshot_url: string | null = null;
      if (file) {
        if (file.size > 5 * 1024 * 1024) throw new Error("Receipt image must be under 5MB");
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${order.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("payment-receipts").upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        screenshot_url = path;
      }
      const { data: pay, error } = await supabase.rpc("submit_payment", {
        p_order_id: order.id,
        p_method: selected.method as any,
        p_transaction_reference: reference.trim(),
        p_screenshot_url: screenshot_url ?? undefined,
      }).maybeSingle();
      if (error) throw error;
      setPayment(pay as Payment);
      toast.success("Payment submitted — awaiting verification");
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      if (msg.includes("payments_txref_unique")) toast.error("This transaction reference was already submitted");
      else toast.error(msg);
    } finally { setBusy(false); }
  };

  if (!order) return <div className="grid min-h-screen place-items-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  // Status view after submit
  if (payment && payment.status !== "pending") {
    return <StatusView payment={payment} order={order} />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link to="/order/$id" params={{ id: order.id }} className="rounded-full p-2 hover:bg-muted"><ChevronLeft className="h-4 w-4" /></Link>
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-primary" />
            <p className="font-display text-sm font-bold">Complete Payment</p>
          </div>
          <span className="w-8" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="rounded-2xl gradient-gold p-6 text-center shadow-gold">
          <p className="text-[11px] uppercase tracking-widest text-primary/70">Order {order.order_number}</p>
          <p className="mt-1 font-display text-4xl font-bold text-primary">{ETB(order.total)}</p>
          <p className="mt-1 text-xs text-primary/70">Pay this amount using one of the methods below</p>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Choose payment method</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {methods.map((m) => (
              <button key={m.id} onClick={() => setSelected(m)}
                className={`rounded-xl border-2 p-3 text-left text-xs transition-smooth ${
                  selected?.id === m.id ? "border-primary bg-primary/5 shadow-elegant" : "border-transparent bg-card shadow-soft"
                }`}>
                <p className="font-display text-sm font-bold">{m.display_name}</p>
              </button>
            ))}
          </div>
        </div>

        {selected && (
          <div className="mt-6 rounded-2xl bg-card p-6 shadow-soft">
            <p className="font-display text-lg font-bold">{selected.display_name} Instructions</p>
            <p className="mt-1 text-sm text-muted-foreground">{selected.instructions}</p>

            <div className="mt-4 space-y-2">
              <CopyRow label="Merchant" value={selected.merchant_name} onCopy={copy} />
              <CopyRow label="Account / Number" value={selected.account_number} onCopy={copy} highlight />
              <CopyRow label="Amount" value={ETB(order.total)} onCopy={() => copy(String(order.total))} highlight />
            </div>

            {selected.method !== "cash" && (
              <div className="mt-6 space-y-4 border-t pt-6">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Transaction Reference *</label>
                  <input value={reference} onChange={(e) => setReference(e.target.value)} maxLength={64}
                    placeholder="e.g. CI5K8N2P9X"
                    className="mt-1.5 w-full rounded-xl border bg-background px-4 py-3 text-sm tracking-wider outline-none focus:ring-2 focus:ring-ring" />
                  <p className="mt-1 text-[11px] text-muted-foreground">From your SMS receipt or bank confirmation</p>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Receipt screenshot (optional)</label>
                  <label className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed bg-muted/30 px-4 py-4 text-sm hover:bg-muted/50">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 truncate text-muted-foreground">{file?.name ?? "Tap to attach receipt image"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
              </div>
            )}

            <button onClick={submit} disabled={busy}
              className="mt-6 w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-smooth hover:shadow-elegant disabled:opacity-60">
              {busy ? "Submitting..." : selected.method === "cash" ? "I'll pay at the counter" : `Verify Payment · ${ETB(order.total)}`}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function CopyRow({ label, value, onCopy, highlight }: { label: string; value: string; onCopy: (v: string) => void; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 ${highlight ? "bg-primary/5" : "bg-muted/40"}`}>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className={`font-mono ${highlight ? "text-lg font-bold" : "text-sm"}`}>{value}</p>
      </div>
      <button onClick={() => onCopy(value)} className="rounded-full glass p-2 hover:shadow-soft">
        <Copy className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function StatusView({ payment, order }: { payment: Payment; order: Order }) {
  const navigate = useNavigate();
  const status = payment.status;
  const config = {
    verifying: { icon: Clock, color: "bg-amber-500/10 text-amber-700 dark:text-amber-300", title: "Verifying your payment", body: "Our team is checking your transaction. This usually takes a few minutes." },
    completed: { icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", title: "Payment verified", body: "Your order has been sent to the kitchen." },
    rejected: { icon: XCircle, color: "bg-rose-500/10 text-rose-700 dark:text-rose-300", title: "Payment rejected", body: payment.rejection_reason ?? "We couldn't verify your transaction. Please try again." },
    failed: { icon: XCircle, color: "bg-rose-500/10 text-rose-700 dark:text-rose-300", title: "Payment failed", body: payment.rejection_reason ?? "Payment failed. Please try again." },
  }[status as "verifying" | "completed" | "rejected" | "failed"] ?? {
    icon: Clock, color: "bg-muted text-muted-foreground", title: "Pending", body: "Awaiting next step.",
  };
  const Icon = config.icon;
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-md px-4 py-12 text-center">
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${config.color}`}>
          <Icon className="h-10 w-10" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold">{config.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{config.body}</p>
        <div className="mt-6 rounded-2xl bg-card p-5 text-left shadow-soft">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Order</p>
          <p className="font-display text-lg font-bold">{order.order_number}</p>
          <p className="mt-2 text-[11px] uppercase tracking-widest text-muted-foreground">Reference</p>
          <p className="font-mono text-sm">{payment.transaction_reference ?? "—"}</p>
          <p className="mt-2 text-[11px] uppercase tracking-widest text-muted-foreground">Amount</p>
          <p className="font-display text-base font-bold">{ETB(order.total)}</p>
        </div>
        {status === "rejected" || status === "failed" ? (
          <button onClick={() => location.reload()} className="mt-6 w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-gold">
            Try again
          </button>
        ) : (
          <button onClick={() => navigate({ to: "/order/$id", params: { id: order.id } })}
            className="mt-6 w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-gold">
            Track my order
          </button>
        )}
      </main>
    </div>
  );
}
