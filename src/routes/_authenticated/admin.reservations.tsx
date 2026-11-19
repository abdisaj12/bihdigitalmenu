import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Calendar, Loader2, Search, Users, Phone, Clock, Filter, RefreshCw, CheckCircle, XCircle, CalendarClock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/reservations")({
  head: () => ({ meta: [
    {"title": "Reservations Management — Bulcha International Hotel"},
    {"name": "description", "content": "Manage table reservations and bookings."},
    {"property": "og:title", "content": "Reservations Management — Bulcha International Hotel"},
    {"property": "og:description", "content": "Manage table reservations and bookings."},
    {"property": "og:type", "content": "website"},
    {"name": "twitter:card", "content": "summary_large_image"},
  ] }),
  component: ReservationsAdmin,
});

type Reservation = {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  status: "pending" | "confirmed" | "seated" | "cancelled" | "completed";
  note: string | null;
  created_at: string;
};

const STATUSES = ["pending", "confirmed", "seated", "cancelled", "completed"] as const;

const statusConfig: Record<Reservation["status"], { color: string; icon: any; label: string }> = {
  pending: { 
    color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-400",
    icon: Clock,
    label: "Pending"
  },
  confirmed: { 
    color: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400",
    icon: CheckCircle,
    label: "Confirmed"
  },
  seated: { 
    color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
    icon: Users,
    label: "Seated"
  },
  cancelled: { 
    color: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400",
    icon: XCircle,
    label: "Cancelled"
  },
  completed: { 
    color: "bg-muted text-muted-foreground border-border",
    icon: CheckCircle,
    label: "Completed"
  },
};

function ReservationsAdmin() {
  const [rows, setRows] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("reservation_date", { ascending: false })
      .order("reservation_time", { ascending: false })
      .limit(500);
    if (error) toast.error(error.message);
    setRows((data as Reservation[]) ?? []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: Reservation["status"]) {
    const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Reservation status updated");
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (!needle) return true;
      return (
        r.customer_name.toLowerCase().includes(needle) ||
        (r.customer_phone ?? "").toLowerCase().includes(needle)
      );
    });
  }, [rows, q, filter]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: rows.length,
      pending: rows.filter(r => r.status === 'pending').length,
      confirmed: rows.filter(r => r.status === 'confirmed').length,
      today: rows.filter(r => r.reservation_date === today).length,
    };
  }, [rows]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservations Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage table bookings and customer reservations
          </p>
        </div>
        <Button onClick={load} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-gradient-to-br from-[#8B1538] to-[#A61D3F] p-2.5 text-white">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs font-medium text-muted-foreground">Total Reservations</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-gradient-to-br from-yellow-600 to-yellow-500 p-2.5 text-white">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold">{stats.pending}</div>
              <div className="text-xs font-medium text-muted-foreground">Pending</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 p-2.5 text-white">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold">{stats.confirmed}</div>
              <div className="text-xs font-medium text-muted-foreground">Confirmed</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-500 p-2.5 text-white">
                <CalendarClock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold">{stats.today}</div>
              <div className="text-xs font-medium text-muted-foreground">Today's Bookings</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Reservations</CardTitle>
              <CardDescription>
                {filtered.length} {filtered.length === 1 ? 'reservation' : 'reservations'} found
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search name or phone..."
                  className="w-full sm:w-64 pl-9 h-10 rounded-lg"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-40 h-10 rounded-lg">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      <span className="capitalize">{s}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-[#8B1538]" />
              <p className="text-sm">Loading reservations...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 opacity-30" />
              <div className="text-center">
                <p className="font-medium">No reservations found</p>
                <p className="text-xs">Try adjusting your search or filter</p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Party Size</TableHead>
                    <TableHead className="font-semibold">Date & Time</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Notes</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => {
                    const statusInfo = statusConfig[r.status];
                    const StatusIcon = statusInfo.icon;
                    return (
                      <TableRow key={r.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#8B1538] to-[#A61D3F] text-sm font-bold text-white">
                              {r.customer_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{r.customer_name}</div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {r.customer_phone ?? "—"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{r.party_size}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 text-sm font-medium">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              {new Date(r.reservation_date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {r.reservation_time.slice(0, 5)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`gap-1.5 border ${statusInfo.color}`} variant="secondary">
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                            {r.note || <span className="italic">No notes</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select 
                            value={r.status} 
                            onValueChange={(v) => updateStatus(r.id, v as Reservation["status"])}
                          >
                            <SelectTrigger className="ml-auto w-36 h-9 rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((s) => {
                                const info = statusConfig[s];
                                const Icon = info.icon;
                                return (
                                  <SelectItem key={s} value={s}>
                                    <div className="flex items-center gap-2">
                                      <Icon className="h-3.5 w-3.5" />
                                      <span className="capitalize">{info.label}</span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
