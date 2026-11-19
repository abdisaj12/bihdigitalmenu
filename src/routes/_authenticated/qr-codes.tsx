import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Crown, Printer, Download, QrCode as QrIcon, ChevronLeft, Utensils, BedDouble } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/qr-codes")({
  head: () => ({ meta: [
    {"title": "Table & Room QR Codes — Bulcha International Hotel"},
    {"name": "description", "content": "Bulcha staff workspace for table & room qr codes."},
    {"property": "og:title", "content": "Table & Room QR Codes — Bulcha International Hotel"},
    {"property": "og:description", "content": "Bulcha staff workspace for table & room qr codes."},
    {"property": "og:type", "content": "website"},
    {"name": "twitter:card", "content": "summary_large_image"},
  ] }),
  component: QrCodesPage,
});

type TableRow = { id: string; table_number: string; is_room: boolean; capacity: number | null };

function QrCodesPage() {
  const [rows, setRows] = useState<TableRow[]>([]);
  const [filter, setFilter] = useState<"all" | "table" | "room">("all");
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    supabase.from("tables").select("id, table_number, is_room, capacity").order("is_room").order("table_number")
      .then(async ({ data, error }) => {
        if (error) toast.error(error.message);
        const list = (data ?? []) as TableRow[];
        setRows(list);
        const entries = await Promise.all(
          list.map(async (r) => {
            const url = buildUrl(origin, r);
            const dataUrl = await QRCode.toDataURL(url, { width: 512, margin: 1, color: { dark: "#1a1a1a", light: "#ffffff" } });
            return [r.id, dataUrl] as const;
          }),
        );
        setQrMap(Object.fromEntries(entries));
        setLoading(false);
      });
  }, [origin]);

  const filtered = useMemo(() => {
    if (filter === "table") return rows.filter((r) => !r.is_room);
    if (filter === "room") return rows.filter((r) => r.is_room);
    return rows;
  }, [rows, filter]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const selectAll = () => setSelected(new Set(filtered.map((r) => r.id)));
  const clear = () => setSelected(new Set());

  const downloadOne = (r: TableRow) => {
    const a = document.createElement("a");
    a.href = qrMap[r.id];
    a.download = `${r.is_room ? "room" : "table"}-${r.table_number}.png`;
    a.click();
  };

  const printSelection = () => {
    const ids = selected.size > 0 ? Array.from(selected) : filtered.map((r) => r.id);
    if (ids.length === 0) return toast.error("Nothing to print");
    const items = ids.map((id) => rows.find((r) => r.id === id)).filter(Boolean) as TableRow[];
    const win = window.open("", "_blank", "width=900,height=1200");
    if (!win) return toast.error("Allow pop-ups to print QR sheet");
    win.document.write(`<!doctype html><html><head><title>Bulcha QR Codes</title>
      <style>
        @page { size: A4; margin: 12mm; }
        body { font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; margin: 0; color: #1a1a1a; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12mm; }
        .card { border: 1px solid #e5e5e5; border-radius: 16px; padding: 18px; text-align: center; break-inside: avoid; page-break-inside: avoid; background: linear-gradient(180deg, #fffdf7 0%, #ffffff 100%); }
        .brand { font-weight: 700; letter-spacing: 0.2em; font-size: 11px; color: #b8860b; text-transform: uppercase; }
        .hotel { font-family: Georgia, serif; font-weight: 700; font-size: 18px; margin-top: 4px; }
        .label { margin-top: 8px; font-size: 13px; color: #555; }
        .num { font-family: Georgia, serif; font-weight: 700; font-size: 38px; line-height: 1; margin: 6px 0 10px; }
        img { width: 220px; height: 220px; }
        .url { margin-top: 10px; font-size: 10px; color: #888; word-break: break-all; }
        .scan { margin-top: 6px; font-size: 12px; font-weight: 600; }
      </style></head><body>
      <div class="grid">
        ${items.map((r) => `
          <div class="card">
            <div class="brand">Bulcha International Hotel</div>
            <div class="hotel">Smart Menu</div>
            <div class="label">${r.is_room ? "Room" : "Table"}</div>
            <div class="num">${r.table_number}</div>
            <img src="${qrMap[r.id]}" alt="QR" />
            <div class="scan">Scan to order</div>
            <div class="url">${buildUrl(origin, r)}</div>
          </div>
        `).join("")}
      </div>
      <script>window.onload = () => { window.print(); };</script>
      </body></html>`);
    win.document.close();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="rounded-full p-2 hover:bg-muted"><ChevronLeft className="h-4 w-4" /></Link>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-gold shadow-gold">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div className="leading-tight">
                <p className="font-display text-base font-bold">QR Code Manager</p>
                <p className="text-[11px] text-muted-foreground">Generate, download & print table / room QR codes</p>
              </div>
            </div>
          </div>
          <button onClick={printSelection} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-gold">
            <Printer className="h-3.5 w-3.5" /> Print {selected.size > 0 ? `(${selected.size})` : "all visible"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 rounded-full bg-muted p-1">
            {(["all", "table", "room"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize ${filter === f ? "bg-background shadow-soft" : "text-muted-foreground"}`}>
                {f === "all" ? "All" : f === "table" ? "Tables" : "Rooms"}
              </button>
            ))}
          </div>
          <div className="flex gap-2 text-xs">
            <button onClick={selectAll} className="rounded-full glass px-3 py-1.5">Select all</button>
            <button onClick={clear} className="rounded-full glass px-3 py-1.5">Clear</button>
          </div>
        </div>

        {loading ? (
          <p className="py-20 text-center text-muted-foreground">Generating QR codes…</p>
        ) : filtered.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">No tables or rooms yet. Add some from the admin panel.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((r) => {
              const isSelected = selected.has(r.id);
              return (
                <div key={r.id} onClick={() => toggle(r.id)}
                  className={`group cursor-pointer rounded-2xl border-2 bg-card p-4 text-center transition-smooth ${isSelected ? "border-primary shadow-gold" : "border-transparent shadow-soft hover:border-border"}`}>
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      {r.is_room ? <BedDouble className="h-3 w-3" /> : <Utensils className="h-3 w-3" />}
                      {r.is_room ? "Room" : "Table"}
                    </span>
                    <span className={`h-3 w-3 rounded-full border ${isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"}`} />
                  </div>
                  <p className="mt-1 font-display text-3xl font-bold">{r.table_number}</p>
                  <div className="mx-auto mt-3 aspect-square w-full max-w-[200px] rounded-xl bg-white p-2 shadow-inner">
                    {qrMap[r.id] ? <img src={qrMap[r.id]} alt={`QR ${r.table_number}`} className="h-full w-full" /> : <QrIcon className="h-full w-full text-muted-foreground/30" />}
                  </div>
                  <p className="mt-3 truncate text-[10px] text-muted-foreground">{buildUrl(origin, r)}</p>
                  <button onClick={(e) => { e.stopPropagation(); downloadOne(r); }}
                    className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full glass py-1.5 text-xs font-medium hover:shadow-elegant">
                    <Download className="h-3 w-3" /> PNG
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function buildUrl(origin: string, r: TableRow) {
  const key = r.is_room ? "room" : "table";
  return `${origin}/menu?${key}=${encodeURIComponent(r.table_number)}`;
}
