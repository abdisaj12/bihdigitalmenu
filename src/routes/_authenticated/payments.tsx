import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Crown, ChevronLeft, Search, CheckCircle2, XCircle, Eye, Clock, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ETB } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/payments")({
  head: () => ({ meta: [
    {"title": "Payment Verification — Bulcha International Hotel"},
    {"name": "description", "content": "Bulcha staff workspace for payment verification."},
    {"property": "og:title", "content": "Payment Verification — Bulcha International Hotel"},
    {"property": "og:description", "content": "Bulcha staff workspace for payment verification."},
    {"property": "og:type", "content": "website"},
    {"name": "twitter:card", "content": "summary_large_image"},
  ] }),
  component: PaymentsPage,
});

type PaymentRow = {
  id: string;
  order_id: string;
  amount: number;
  method: string;
  status: string;
  transaction_reference: string | null;
  screenshot_url: string | null;
  notes: string | null;
  rejection_reason: string | null;
  created_at: string;
  verified_by: string | null;
  verification_date: string | null;
  orders: {
    order_number: string;
    customer_name: string;
    customer_phone: string | null;
    total: number;
  } | null;
};

type Filter = "verifying" | "completed" | "rejected" | "all";

function PaymentsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [filter, setFilter] = useState<Filter>("verifying");
  const [q, setQ] = useState("");
  const [method, setMethod] = useState<string>("all");
  const [active, setActive] = useState<PaymentRow | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("payments")
      .select("id, order_id, amount, method, status, transaction_reference, screenshot_url, notes, rejection_reason, created_at, verified_by, verification_date, orders(order_number, customer_name, customer_phone, total)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) toast.error(error.message);
    setRows((data ?? []) as any);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("payments-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (method !== "all" && r.method !== method) return false;
      if (q) {
        const needle = q.toLowerCase();
        const hit =
          r.transaction_reference?.toLowerCase().includes(needle) ||
          r.orders?.order_number.toLowerCase().includes(needle) ||
          r.orders?.customer_phone?.toLowerCase().includes(needle) ||
          r.orders?.customer_name.toLowerCase().includes(needle);
        if (!hit) return false;
      }
      return true;
    });
  }, [rows, filter, q, method]);

  const counts = useMemo(() => ({
    verifying: rows.filter((r) => r.status === "verifying").length,
    completed: rows.filter((r) => r.status === "completed").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
    all: rows.length,
  }), [rows]);

  const approve = async (p: PaymentRow) => {
    if (!user) return;
    const { error } = await supabase.from("payments").update({
      status: "completed",
      verified_by: user.id,
      verification_date: new Date().toISOString(),
    }).eq("id", p.id);
    if (error) return toast.error(error.message);
    await supabase.from("orders").update({ payment_status: "completed", status: "accepted" }).eq("id", p.order_id);
    await supabase.from("payment_audit_log").insert({
      payment_id: p.id, order_id: p.order_id, action: "approve",
      previous_status: p.status as any, new_status: "completed", performed_by: user.id,
    });
    toast.success("Payment approved · order sent to kitchen");
    setActive(null);
  };

  const reject = async (p: PaymentRow, reason: string) => {
    if (!user) return;
    if (!reason.trim()) return toast.error("Please provide a reason");
    const { error } = await supabase.from("payments").update({
      status: "rejected",
      verified_by: user.id,
      verification_date: new Date().toISOString(),
      rejection_reason: reason.trim(),
    }).eq("id", p.id);
    if (error) return toast.error(error.message);
    await supabase.from("orders").update({ payment_status: "failed" }).eq("id", p.order_id);
    await supabase.from("payment_audit_log").insert({
      payment_id: p.id, order_id: p.order_id, action: "reject",
      previous_status: p.status as any, new_status: "rejected", performed_by: user.id, notes: reason.trim(),
    });
    toast.success("Payment rejected");
    setActive(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="rounded-full p-2 hover:bg-muted"><ChevronLeft className="h-4 w-4" /></Link>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-gold shadow-gold">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div className="leading-tight">
                <p className="font-display text-base font-bold">Payment Verification</p>
                <p className="text-[11px] text-muted-foreground">Review and approve customer transactions</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi label="Pending" value={counts.verifying} icon={Clock} accent="amber" onClick={() => setFilter("verifying")} active={filter === "verifying"} />
          <Kpi label="Approved" value={counts.completed} icon={CheckCircle2} accent="emerald" onClick={() => setFilter("completed")} active={filter === "completed"} />
          <Kpi label="Rejected" value={counts.rejected} icon={XCircle} accent="rose" onClick={() => setFilter("rejected")} active={filter === "rejected"} />
          <Kpi label="All" value={counts.all} icon={AlertCircle} accent="muted" onClick={() => setFilter("all")} active={filter === "all"} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ref, order #, phone or name"
              className="w-full rounded-full border bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <select value={method} onChange={(e) => setMethod(e.target.value)}
            className="rounded-full border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option value="all">All methods</option>
            <option value="telebirr">Telebirr</option>
            <option value="cbe_birr">CBE Birr</option>
            <option value="chapa">Awash Bank</option>
            <option value="visa">Bank of Abyssinia</option>
            <option value="cash">Cash</option>
          </select>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-soft">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">No payments match these filters.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-[11px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Method</th>
                  <th className="px-4 py-3 text-left">Reference</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs">{r.orders?.order_number ?? "—"}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{r.orders?.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{r.orders?.customer_phone ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3 capitalize">{r.method.replace("_", " ")}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.transaction_reference ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-display font-bold">{ETB(r.amount)}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setActive(r)} className="inline-flex items-center gap-1 rounded-full glass px-3 py-1.5 text-xs font-medium hover:shadow-soft">
                        <Eye className="h-3 w-3" /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {active && <ReviewModal payment={active} onClose={() => setActive(null)} onApprove={approve} onReject={reject} />}
    </div>
  );
}

function Kpi({ label, value, icon: Icon, accent, onClick, active }: any) {
  const colors: Record<string, string> = {
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    rose: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <button onClick={onClick}
      className={`rounded-2xl border-2 p-4 text-left transition-smooth ${active ? "border-primary shadow-elegant" : "border-transparent bg-card shadow-soft"}`}>
      <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg ${colors[accent]}`}><Icon className="h-4 w-4" /></div>
      <p className="font-display text-3xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    verifying: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    rejected: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    failed: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    pending: "bg-muted text-muted-foreground",
  };
  return <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${map[status] ?? map.pending}`}>{status}</span>;
}

function ReviewModal({ payment, onClose, onApprove, onReject }: {
  payment: PaymentRow; onClose: () => void;
  onApprove: (p: PaymentRow) => void; onReject: (p: PaymentRow, reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [signed, setSigned] = useState<string | null>(null);

  useEffect(() => {
    if (!payment.screenshot_url) return;
    supabase.storage.from("payment-receipts").createSignedUrl(payment.screenshot_url, 600)
      .then(({ data }) => setSigned(data?.signedUrl ?? null));
  }, [payment.screenshot_url]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-elegant" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Order {payment.orders?.order_number}</p>
            <p className="mt-1 font-display text-2xl font-bold">{ETB(payment.amount)}</p>
          </div>
          <StatusBadge status={payment.status} />
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <Field label="Customer" value={payment.orders?.customer_name} />
          <Field label="Phone" value={payment.orders?.customer_phone ?? "—"} />
          <Field label="Method" value={payment.method.replace("_", " ")} />
          <Field label="Reference" value={payment.transaction_reference ?? "—"} mono />
          <Field label="Submitted" value={new Date(payment.created_at).toLocaleString()} />
          <Field label="Order total" value={ETB(payment.orders?.total ?? 0)} />
        </dl>

        {payment.screenshot_url && (
          <div className="mt-4">
            <p className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">Receipt</p>
            {signed ? (
              <a href={signed} target="_blank" rel="noreferrer">
                <img src={signed} alt="receipt" className="max-h-64 w-full rounded-xl border object-contain" />
              </a>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-xl border bg-muted/30"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
            )}
          </div>
        )}

        {payment.rejection_reason && (
          <div className="mt-4 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">
            <p className="font-semibold">Rejection reason</p>
            <p className="mt-1">{payment.rejection_reason}</p>
          </div>
        )}

        {payment.status === "verifying" && (
          <>
            {showReject ? (
              <div className="mt-5 space-y-3">
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} rows={3}
                  placeholder="Reason for rejection (visible to customer)"
                  className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
                <div className="flex gap-2">
                  <button onClick={() => setShowReject(false)} className="flex-1 rounded-full glass py-2.5 text-sm font-medium">Cancel</button>
                  <button onClick={() => onReject(payment, reason)} className="flex-1 rounded-full bg-rose-600 py-2.5 text-sm font-semibold text-white">Confirm reject</button>
                </div>
              </div>
            ) : (
              <div className="mt-5 flex gap-2">
                <button onClick={() => setShowReject(true)} className="flex-1 rounded-full border border-rose-200 bg-rose-500/5 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-500/10 dark:text-rose-300">
                  Reject
                </button>
                <button onClick={() => onApprove(payment)} className="flex-1 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-gold">
                  Approve & send to kitchen
                </button>
              </div>
            )}
          </>
        )}

        <button onClick={onClose} className="mt-4 w-full rounded-full glass py-2.5 text-xs font-medium">Close</button>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: any; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className={`mt-0.5 ${mono ? "font-mono text-xs" : "text-sm"} font-medium capitalize`}>{value}</dd>
    </div>
  );
}
