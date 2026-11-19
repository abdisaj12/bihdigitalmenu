import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  head: () => ({ meta: [
    {"title": "Audit Logs — Bulcha International Hotel"},
    {"name": "description", "content": "Bulcha staff workspace for audit logs."},
    {"property": "og:title", "content": "Audit Logs — Bulcha International Hotel"},
    {"property": "og:description", "content": "Bulcha staff workspace for audit logs."},
    {"property": "og:type", "content": "website"},
    {"name": "twitter:card", "content": "summary_large_image"},
  ] }),
  component: AuditLogPage,
});

type Log = {
  id: string;
  action: string;
  field: string | null;
  old_value: unknown;
  new_value: unknown;
  food_id: string | null;
  food_name: string | null;
  user_id: string | null;
  user_email: string | null;
  created_at: string;
};

const fmt = (v: unknown) => {
  if (v == null) return "—";
  if (typeof v === "string") return v;
  try { return JSON.stringify(v); } catch { return String(v); }
};

function AuditLogPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("menu_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      setLogs((data as Log[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Logs</CardTitle>
        <p className="text-sm text-muted-foreground">Every change to menu items, last 200 entries</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : logs.length === 0 ? (
          <div className="text-muted-foreground">No audit entries yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Old</TableHead>
                  <TableHead>New</TableHead>
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(l.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{l.action}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{l.field ?? "—"}</TableCell>
                    <TableCell className="max-w-[180px] truncate text-xs text-muted-foreground">
                      {fmt(l.old_value)}
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate text-xs">{fmt(l.new_value)}</TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">
                      {l.user_email ?? l.user_id?.slice(0, 8) ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
